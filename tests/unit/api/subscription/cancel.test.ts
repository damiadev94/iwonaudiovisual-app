import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockAdminFrom, mockCancelSub } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockCancelSub: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from: mockAdminFrom })),
}));

vi.mock("@/lib/mercadopago/subscription", () => ({
  cancelSubscription: mockCancelSub,
}));

import { POST } from "@/app/api/subscription/cancel/route";

// UUID válido para los tests (v4: version digit=4, variant digit=[89ab])
const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/subscription/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Configura adminFrom para un escenario donde existe la suscripción */
function mockFoundSubscription(subscription: object) {
  const mockSingle = vi.fn().mockResolvedValue({ data: subscription, error: null });
  const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
  const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
  mockAdminFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });
  return { mockUpdate, mockUpdateEq };
}

/** Configura adminFrom para un escenario donde NO existe la suscripción */
function mockNotFoundSubscription() {
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
  const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
  mockAdminFrom.mockReturnValue({ select: mockSelect });
}

describe("POST /api/subscription/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si el usuario no está autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(makeRequest({ subscriptionId: VALID_UUID }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("No autorizado");
  });

  it("devuelve 400 si subscriptionId no es un UUID válido", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    const response = await POST(makeRequest({ subscriptionId: "not-a-uuid" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("devuelve 400 si subscriptionId está ausente", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    const response = await POST(makeRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
  });

  it("devuelve 404 si la suscripción no existe", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNotFoundSubscription();

    const response = await POST(makeRequest({ subscriptionId: VALID_UUID }));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Suscripcion no encontrada");
  });

  it("cancela en MP y actualiza el estado en la DB", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { mockUpdate } = mockFoundSubscription({
      id: VALID_UUID,
      user_id: "user-123",
      mp_preapproval_id: "PREAPPROVAL_123",
      status: "active",
    });
    mockCancelSub.mockResolvedValue({ id: "PREAPPROVAL_123", status: "cancelled" });

    const response = await POST(makeRequest({ subscriptionId: VALID_UUID }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCancelSub).toHaveBeenCalledWith("PREAPPROVAL_123");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
  });

  it("actualiza la DB aunque no haya mp_preapproval_id (suscripción pendiente)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { mockUpdate } = mockFoundSubscription({
      id: VALID_UUID,
      user_id: "user-123",
      mp_preapproval_id: null,
      status: "pending",
    });

    const response = await POST(makeRequest({ subscriptionId: VALID_UUID }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // No hay preapproval_id → no se llama a MP
    expect(mockCancelSub).not.toHaveBeenCalled();
    // Pero sí se actualiza la DB
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" })
    );
  });

  it("devuelve 500 si ocurre un error inesperado", async () => {
    mockGetUser.mockRejectedValue(new Error("Unexpected error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(makeRequest({ subscriptionId: VALID_UUID }));
    const data = await response.json();

    consoleSpy.mockRestore();
    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
