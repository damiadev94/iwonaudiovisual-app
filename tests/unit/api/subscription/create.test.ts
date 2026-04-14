import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock fns
const { mockGetUser, mockAdminFrom, mockCreateSub } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockCreateSub: vi.fn(),
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
  createSubscription: mockCreateSub,
}));

import { POST } from "@/app/api/subscription/create/route";

// ─── helpers ────────────────────────────────────────────────
function mockExistingActiveSub() {
  const mockSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "SUB_ACTIVE", status: "active" }, error: null });
  mockAdminFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
    }),
  });
}

function mockNoExistingSub() {
  const mockSingle = vi
    .fn()
    .mockResolvedValue({ data: null, error: null });
  const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
  mockAdminFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
    }),
    insert: mockInsert,
  });
  return { mockInsert };
}

// ─── tests ──────────────────────────────────────────────────
describe("POST /api/subscription/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("retorna 401 si el usuario no está autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("retorna redirect:/dashboard si el usuario ya tiene suscripción activa", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockExistingActiveSub();

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.redirect).toBe("/dashboard");
  });

  it("crea suscripción en MP y retorna init_point", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { mockInsert } = mockNoExistingSub();

    const mpInitPoint =
      "https://www.mercadopago.com.ar/subscriptions/checkout?id=PREAPPROVAL_123";
    mockCreateSub.mockResolvedValue({
      id: "PREAPPROVAL_123",
      init_point: mpInitPoint,
    });

    const response = await POST();
    const data = await response.json();

    expect(mockCreateSub).toHaveBeenCalledWith("test@example.com", "user-123");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      mp_subscription_id: "PREAPPROVAL_123",
      status: "pending",
      plan_amount: 14999,
      currency: "ARS",
    });
    expect(response.status).toBe(200);
    expect(data.init_point).toBe(mpInitPoint);
  });

  it("retorna 500 si init_point está ausente", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockCreateSub.mockResolvedValue({ id: "PREAPPROVAL_123", init_point: null });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST();
    const data = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(data.error).toBe("payment_error");
  });

  it("retorna 500 con mensaje si MP lanza error inesperado", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockCreateSub.mockRejectedValue(new Error("MP API error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST();
    const data = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(data.error).toBe("payment_error");
    expect(data.message).toBe("MP API error");
  });
});
