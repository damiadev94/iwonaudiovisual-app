/**
 * Test de integración: flujo completo de suscripción
 *
 * Simula el recorrido real del usuario:
 *   1. Usuario autenticado solicita suscripción → GET /api/subscription/create
 *      → suscripción "pending" guardada en DB, redirect al checkout de MP
 *   2. MercadoPago confirma el pago → POST /api/webhooks/mercadopago
 *      → suscripción actualizada a "active", pago registrado
 *   3. Usuario decide cancelar → POST /api/subscription/cancel
 *      → suscripción actualizada a "cancelled", cancelación propagada a MP
 *
 * Se usa una "DB en memoria" para que los tres pasos compartan estado.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac, randomUUID } from "crypto";

// ─── DB en memoria ────────────────────────────────────────────────────────────
interface Subscription {
  id: string;
  user_id: string;
  mp_subscription_id?: string;
  mp_preapproval_id?: string;
  status: string;
  plan_amount?: number;
  currency?: string;
}

interface Payment {
  user_id: string;
  subscription_id: string;
  mp_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
}

const db = {
  subscriptions: [] as Subscription[],
  payments: [] as Payment[],
};

// ─── Mock del cliente Supabase con estado compartido ─────────────────────────
function createMockSupabaseClient() {
  return {
    from(table: "subscriptions" | "payments") {
      if (table === "subscriptions") {
        return {
          select(_cols: string) {
            return {
              eq(col: keyof Subscription, val: string) {
                return {
                  // Para single() tras dos .eq()
                  eq(col2: keyof Subscription, val2: string) {
                    return {
                      single: async () => {
                        const found = db.subscriptions.find(
                          (s) => s[col] === val && s[col2] === val2
                        );
                        return { data: found ?? null, error: null };
                      },
                    };
                  },
                  // Para order().limit().single() (búsqueda de suscripción más reciente)
                  order(_field: string, _opts: unknown) {
                    return {
                      limit(_n: number) {
                        return {
                          single: async () => {
                            const found = db.subscriptions.find(
                              (s) => s[col] === val
                            );
                            return { data: found ?? null, error: null };
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          insert: async (data: Omit<Subscription, "id">) => {
            const record = { id: randomUUID(), ...data };
            db.subscriptions.push(record);
            return { data: record, error: null };
          },
          update(changes: Partial<Subscription>) {
            return {
              eq: async (col: keyof Subscription, val: string) => {
                db.subscriptions.forEach((s) => {
                  if (s[col] === val) Object.assign(s, changes);
                });
                return { data: null, error: null };
              },
            };
          },
        };
      }

      // table === "payments"
      return {
        insert: async (data: Payment) => {
          db.payments.push(data);
          return { data, error: null };
        },
      };
    },
  };
}

// ─── Fns hoisted para los mocks ──────────────────────────────────────────────
const {
  mockGetUser,
  mockMPCreate,
  mockMPPreApprovalGet,
  mockMPPaymentGet,
  mockMPUpdate,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockMPCreate: vi.fn(),
  mockMPPreApprovalGet: vi.fn(),
  mockMPPaymentGet: vi.fn(),
  mockMPUpdate: vi.fn(),
}));

// ─── Mocks de módulos ─────────────────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => createMockSupabaseClient()),
}));

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {}),
  PreApproval: vi.fn(function () {
    return { create: mockMPCreate, update: mockMPUpdate, get: mockMPPreApprovalGet };
  }),
  Payment: vi.fn(function () {
    return { get: mockMPPaymentGet };
  }),
}));

vi.mock("@/lib/mercadopago/client", () => ({ mercadopago: {} }));

// ─── Imports de los handlers bajo prueba ─────────────────────────────────────
import { POST as createRoute } from "@/app/api/subscription/create/route";
import { POST as webhookRoute } from "@/app/api/webhooks/mercadopago/route";
import { POST as cancelRoute } from "@/app/api/subscription/cancel/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const USER = { id: "user-flow-abc", email: "flow@example.com" };
const MP_PREAPPROVAL_ID = "PREAPPROVAL_FLOW_001";
const MP_INIT_POINT = "https://www.mercadopago.com.ar/checkout?id=FLOW_001";
const MP_PAYMENT_ID = "PAY_FLOW_999";
const SECRET = "TEST_WEBHOOK_SECRET";

function buildWebhookSignature(body: { data: { id: string } }, requestId: string, ts: string) {
  const manifest = `id:${body.data.id};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", SECRET).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Flujo de suscripción completo (integración)", () => {
  beforeEach(() => {
    db.subscriptions = [];
    db.payments = [];
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.MERCADOPAGO_BACK_URL = "http://localhost:3000";
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
  });

  it("flujo completo: crear → webhook authorized → cancelar", async () => {
    // ── Fase 1: usuario solicita suscripción ─────────────────────────────────
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockMPCreate.mockResolvedValue({
      id: MP_PREAPPROVAL_ID,
      init_point: MP_INIT_POINT,
    });

    const createResponse = await createRoute();
    const createData = await createResponse.json();

    // Devuelve init_point para que el cliente redirija
    expect(createResponse.status).toBe(200);
    expect(createData.init_point).toBe(MP_INIT_POINT);

    // DB tiene una suscripción en estado pending
    expect(db.subscriptions).toHaveLength(1);
    expect(db.subscriptions[0].status).toBe("pending");
    expect(db.subscriptions[0].mp_subscription_id).toBe(MP_PREAPPROVAL_ID);
    expect(db.subscriptions[0].user_id).toBe(USER.id);

    const subscriptionId = db.subscriptions[0].id;

    // ── Fase 2: MP envía webhook (suscripción autorizada) ────────────────────
    mockMPPreApprovalGet.mockResolvedValue({
      id: MP_PREAPPROVAL_ID,
      status: "authorized",
      date_created: "2024-06-01T00:00:00Z",
    });

    const webhookBody = {
      id: 1,
      live_mode: false,
      type: "subscription_preapproval",
      date_created: "2024-06-01T00:00:00Z",
      user_id: 123456,
      api_version: "v1",
      action: "updated",
      data: { id: MP_PREAPPROVAL_ID },
    };

    const ts = "1700000000";
    const signature = buildWebhookSignature(webhookBody, "req-001", ts);
    const webhookRequest = new Request(
      "http://localhost:3000/api/webhooks/mercadopago",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
          "x-request-id": "req-001",
        },
        body: JSON.stringify(webhookBody),
      }
    );

    const webhookResponse = await webhookRoute(webhookRequest);
    expect(webhookResponse.status).toBe(200);
    expect(await webhookResponse.json()).toEqual({ received: true });

    // DB: suscripción ahora está activa
    expect(db.subscriptions[0].status).toBe("active");
    expect(db.subscriptions[0].mp_preapproval_id).toBe(MP_PREAPPROVAL_ID);

    // ── Fase 2b: MP envía webhook de pago aprobado ───────────────────────────
    mockMPPaymentGet.mockResolvedValue({
      id: MP_PAYMENT_ID,
      status: "approved",
      external_reference: USER.id,
      transaction_amount: 14999,
      currency_id: "ARS",
      payment_method_id: "credit_card",
    });

    const paymentWebhookBody = {
      id: 2,
      live_mode: false,
      type: "payment",
      date_created: "2024-06-01T00:00:00Z",
      user_id: 123456,
      api_version: "v1",
      action: "payment.created",
      data: { id: MP_PAYMENT_ID },
    };

    const paymentWebhookRequest = new Request(
      "http://localhost:3000/api/webhooks/mercadopago",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentWebhookBody),
      }
    );

    await webhookRoute(paymentWebhookRequest);

    // DB: el pago fue registrado
    expect(db.payments).toHaveLength(1);
    expect(db.payments[0].status).toBe("approved");
    expect(db.payments[0].user_id).toBe(USER.id);
    expect(db.payments[0].mp_payment_id).toBe(String(MP_PAYMENT_ID));

    // ── Fase 3: usuario cancela la suscripción ───────────────────────────────
    // Autenticamos al mismo usuario
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockMPUpdate.mockResolvedValue({ id: MP_PREAPPROVAL_ID, status: "cancelled" });

    const cancelRequest = new Request(
      "http://localhost:3000/api/subscription/cancel",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      }
    );

    const cancelResponse = await cancelRoute(cancelRequest);
    const cancelData = await cancelResponse.json();

    expect(cancelResponse.status).toBe(200);
    expect(cancelData.success).toBe(true);

    // MP fue notificado de la cancelación
    expect(mockMPUpdate).toHaveBeenCalledWith({
      id: MP_PREAPPROVAL_ID,
      body: { status: "cancelled" },
    });

    // DB: suscripción cancelada
    expect(db.subscriptions[0].status).toBe("cancelled");
  });

  it("redirige al dashboard si el usuario ya tiene suscripción activa al intentar crear otra", async () => {
    // Insertar suscripción activa preexistente
    db.subscriptions.push({
      id: "SUB_EXISTING",
      user_id: USER.id,
      mp_subscription_id: "PREAPPROVAL_OLD",
      status: "active",
    });

    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    const response = await createRoute();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.redirect).toBe("/dashboard");
    // MP no fue contactado
    expect(mockMPCreate).not.toHaveBeenCalled();
    // No se creó una segunda suscripción
    expect(db.subscriptions).toHaveLength(1);
  });
});
