import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "crypto";

// Hoist mocks so they're accessible inside vi.mock factories
const { mockPreApprovalGet, mockPaymentGet, mockSupabaseFrom } = vi.hoisted(
  () => ({
    mockPreApprovalGet: vi.fn(),
    mockPaymentGet: vi.fn(),
    mockSupabaseFrom: vi.fn(),
  })
);

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function () {}),
  PreApproval: vi.fn(function () {
    return { get: mockPreApprovalGet };
  }),
  Payment: vi.fn(function () {
    return { get: mockPaymentGet };
  }),
}));

vi.mock("@/lib/mercadopago/client", () => ({
  mercadopago: {},
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from: mockSupabaseFrom })),
}));

import {
  verifyWebhookSignature,
  processWebhookEvent,
} from "@/lib/mercadopago/webhook";

// Helper: computes a valid MercadoPago webhook signature
function buildValidSignature(
  body: { data: { id: string } },
  requestId: string,
  ts: string,
  secret: string
): string {
  const manifest = `id:${body.data.id};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

const SECRET = "TEST_WEBHOOK_SECRET";

describe("lib/mercadopago/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERCADOPAGO_WEBHOOK_SECRET = SECRET;
  });

  // ─────────────────────────────────────────────────────────
  // verifyWebhookSignature
  // ─────────────────────────────────────────────────────────
  describe("verifyWebhookSignature", () => {
    it("devuelve false si signature es null", () => {
      expect(
        verifyWebhookSignature({ data: { id: "123" } }, null, "req-id")
      ).toBe(false);
    });

    it("devuelve false si requestId es null", () => {
      expect(
        verifyWebhookSignature({ data: { id: "123" } }, "ts=1,v1=abc", null)
      ).toBe(false);
    });

    it("devuelve false si MERCADOPAGO_WEBHOOK_SECRET no está definido", () => {
      delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
      expect(
        verifyWebhookSignature({ data: { id: "123" } }, "ts=1,v1=abc", "req-id")
      ).toBe(false);
    });

    it("devuelve false si signature no tiene la parte ts=", () => {
      expect(
        verifyWebhookSignature({ data: { id: "123" } }, "v1=abc", "req-id")
      ).toBe(false);
    });

    it("devuelve false si signature no tiene la parte v1=", () => {
      expect(
        verifyWebhookSignature({ data: { id: "123" } }, "ts=1700000000", "req-id")
      ).toBe(false);
    });

    it("devuelve true con una firma HMAC válida", () => {
      const body = { data: { id: "SUB_123" } };
      const requestId = "req-abc-123";
      const ts = "1700000000";
      const signature = buildValidSignature(body, requestId, ts, SECRET);

      expect(verifyWebhookSignature(body, signature, requestId)).toBe(true);
    });

    it("devuelve false con una firma inválida", () => {
      expect(
        verifyWebhookSignature(
          { data: { id: "SUB_123" } },
          "ts=1700000000,v1=invalido",
          "req-id"
        )
      ).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // processWebhookEvent — subscription_preapproval
  // ─────────────────────────────────────────────────────────
  describe("processWebhookEvent — subscription_preapproval", () => {
    function buildSubEvent(id: string) {
      return {
        id: 1,
        live_mode: true,
        type: "subscription_preapproval" as const,
        date_created: "2024-01-01",
        user_id: 123,
        api_version: "v1",
        action: "updated",
        data: { id },
      };
    }

    function setupSubMock() {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseFrom.mockReturnValue({ update: mockUpdate });
      return { mockUpdate, mockEq };
    }

    it("actualiza la suscripción a active cuando MP envía authorized", async () => {
      mockPreApprovalGet.mockResolvedValue({
        id: "PREAPPROVAL_123",
        status: "authorized",
        date_created: "2024-01-01T00:00:00Z",
      });
      const { mockUpdate } = setupSubMock();

      await processWebhookEvent(buildSubEvent("PREAPPROVAL_123"));

      expect(mockPreApprovalGet).toHaveBeenCalledWith({ id: "PREAPPROVAL_123" });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "active" })
      );
    });

    it("mapea paused → paused en la DB", async () => {
      mockPreApprovalGet.mockResolvedValue({
        id: "PREAPPROVAL_123",
        status: "paused",
        date_created: "2024-01-01T00:00:00Z",
      });
      const { mockUpdate } = setupSubMock();

      await processWebhookEvent(buildSubEvent("PREAPPROVAL_123"));

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "paused" })
      );
    });

    it("mapea cancelled → cancelled en la DB", async () => {
      mockPreApprovalGet.mockResolvedValue({
        id: "PREAPPROVAL_123",
        status: "cancelled",
        date_created: "2024-01-01T00:00:00Z",
      });
      const { mockUpdate } = setupSubMock();

      await processWebhookEvent(buildSubEvent("PREAPPROVAL_123"));

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "cancelled" })
      );
    });

    it("mapea pending → pending en la DB para estados desconocidos", async () => {
      mockPreApprovalGet.mockResolvedValue({
        id: "PREAPPROVAL_123",
        status: "unknown_status",
        date_created: "2024-01-01T00:00:00Z",
      });
      const { mockUpdate } = setupSubMock();

      await processWebhookEvent(buildSubEvent("PREAPPROVAL_123"));

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending" })
      );
    });

    it("actualiza el campo mp_preapproval_id con el ID de MP", async () => {
      mockPreApprovalGet.mockResolvedValue({
        id: "PREAPPROVAL_ABC",
        status: "authorized",
        date_created: "2024-06-01T00:00:00Z",
      });
      const { mockUpdate } = setupSubMock();

      await processWebhookEvent(buildSubEvent("PREAPPROVAL_ABC"));

      expect(mockUpdate).toHaveBeenCalledWith({
        status: "active",
        mp_preapproval_id: "PREAPPROVAL_ABC",
        current_period_start: "2024-06-01T00:00:00Z",
      });
    });

    it("maneja errores de MP sin lanzar excepción", async () => {
      mockPreApprovalGet.mockRejectedValue(new Error("MP API error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        processWebhookEvent(buildSubEvent("PREAPPROVAL_123"))
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────────────────
  // processWebhookEvent — payment
  // ─────────────────────────────────────────────────────────
  describe("processWebhookEvent — payment", () => {
    function buildPaymentEvent(id: string) {
      return {
        id: 2,
        live_mode: true,
        type: "payment" as const,
        date_created: "2024-01-01",
        user_id: 123,
        api_version: "v1",
        action: "payment.created",
        data: { id },
      };
    }

    it("inserta un registro de pago aprobado en la DB", async () => {
      mockPaymentGet.mockResolvedValue({
        id: 999,
        status: "approved",
        external_reference: "user-uuid-123",
        transaction_amount: 9999,
        currency_id: "ARS",
        payment_method_id: "credit_card",
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "SUB_DB_ID" },
        error: null,
      });
      const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEqSub = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSub });
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ data: null, error: null });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === "subscriptions") return { select: mockSelect };
        if (table === "payments") return { insert: mockInsert };
      });

      await processWebhookEvent(buildPaymentEvent("999"));

      expect(mockPaymentGet).toHaveBeenCalledWith({ id: "999" });
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-uuid-123",
        subscription_id: "SUB_DB_ID",
        mp_payment_id: "999",
        amount: 9999,
        currency: "ARS",
        status: "approved",
        payment_method: "credit_card",
      });
    });

    it("mapea status rejected → rejected en la DB", async () => {
      mockPaymentGet.mockResolvedValue({
        id: 888,
        status: "rejected",
        external_reference: "user-uuid-123",
        transaction_amount: 9999,
        currency_id: "ARS",
        payment_method_id: "debit_card",
      });

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: { id: "SUB_DB_ID" }, error: null });
      const mockLimit = vi.fn().mockReturnValue({ single: mockSingle });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEqSub = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSub });
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ data: null, error: null });

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === "subscriptions") return { select: mockSelect };
        if (table === "payments") return { insert: mockInsert };
      });

      await processWebhookEvent(buildPaymentEvent("888"));

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ status: "rejected" })
      );
    });

    it("no inserta pago si external_reference es null", async () => {
      mockPaymentGet.mockResolvedValue({
        id: 777,
        status: "approved",
        external_reference: null,
        transaction_amount: 9999,
        currency_id: "ARS",
        payment_method_id: "credit_card",
      });

      const mockInsert = vi.fn();
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert });

      await processWebhookEvent(buildPaymentEvent("777"));

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("maneja errores de MP sin lanzar excepción", async () => {
      mockPaymentGet.mockRejectedValue(new Error("MP API error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(
        processWebhookEvent(buildPaymentEvent("999"))
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });
});
