import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock fns
const { mockGetUser, mockAdminFrom, mockCreateSubscriptionForUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockCreateSubscriptionForUser: vi.fn(),
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
  createSubscriptionForUser: mockCreateSubscriptionForUser,
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
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
  mockAdminFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
    }),
    upsert: mockUpsert,
  });
  return { mockUpsert };
}

// ─── tests ──────────────────────────────────────────────────
describe("POST /api/subscription/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("retorna 401 si el usuario no está autenticado", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(new Request("http://localhost"));
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

    const response = await POST(new Request("http://localhost"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.redirect).toBe("/dashboard");
  });

  it("crea PreApproval y guarda mp_preapproval_id en pending", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { mockUpsert } = mockNoExistingSub();

    const initPoint = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=PREAPPROVAL_ABC";
    mockCreateSubscriptionForUser.mockResolvedValue({
      preapproval_id: "PREAPPROVAL_ABC",
      init_point: initPoint,
    });

    const response = await POST(new Request("http://localhost"));
    const data = await response.json();

    expect(mockCreateSubscriptionForUser).toHaveBeenCalledWith("user-123", "test@example.com");
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: "user-123",
        mp_preapproval_id: "PREAPPROVAL_ABC",
        mp_subscription_id: "PREAPPROVAL_ABC",
        status: "pending",
        plan_amount: 14999,
        currency: "ARS",
      },
      { onConflict: "user_id" }
    );
    expect(response.status).toBe(200);
    expect(data.init_point).toBe(initPoint);
  });

  it("retorna 500 si createSubscriptionForUser lanza un error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockCreateSubscriptionForUser.mockRejectedValue(new Error("MP API error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(new Request("http://localhost"));
    const data = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(data.error).toBe("payment_setup_failed");
  });
});
