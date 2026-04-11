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

import { GET } from "@/app/api/subscription/create/route";

// ─── helpers ────────────────────────────────────────────────
/** Mocks adminFrom para el escenario "ya tiene suscripción activa" */
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

/** Mocks adminFrom para el escenario "sin suscripción previa" */
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
describe("GET /api/subscription/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("redirige a /login si el usuario no está autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirige a /dashboard si el usuario ya tiene suscripción activa", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockExistingActiveSub();

    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("crea suscripción en MP y redirige al init_point", async () => {
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

    const response = await GET();

    expect(mockCreateSub).toHaveBeenCalledWith("test@example.com", "user-123");
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: "user-123",
      mp_subscription_id: "PREAPPROVAL_123",
      status: "pending",
      plan_amount: 9999,
      currency: "ARS",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(mpInitPoint);
  });

  it("redirige a /dashboard?error=payment si init_point está ausente", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockCreateSub.mockResolvedValue({ id: "PREAPPROVAL_123", init_point: null });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await GET();
    consoleSpy.mockRestore();

    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/dashboard");
    expect(location).toContain("error=payment");
  });

  it("redirige a /dashboard?error=payment si MP lanza error inesperado", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockCreateSub.mockRejectedValue(new Error("MP API error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await GET();
    consoleSpy.mockRestore();

    expect(response.status).toBe(307);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("error=payment");
  });
});
