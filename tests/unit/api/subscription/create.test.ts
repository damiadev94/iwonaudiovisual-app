import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock fns
const { mockGetUser, mockAdminFrom, mockGetSubscribeUrl } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockGetSubscribeUrl: vi.fn(),
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
  getSubscribeUrl: mockGetSubscribeUrl,
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

  it("genera URL de checkout y retorna init_point", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { mockUpsert } = mockNoExistingSub();

    const checkoutUrl =
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=PLAN_123&external_reference=user-123";
    mockGetSubscribeUrl.mockResolvedValue(checkoutUrl);

    const response = await POST();
    const data = await response.json();

    expect(mockGetSubscribeUrl).toHaveBeenCalledWith("user-123", "test@example.com");
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: "user-123",
        status: "pending",
        plan_amount: 14999,
        currency: "ARS",
      },
      { onConflict: "user_id" }
    );
    expect(response.status).toBe(200);
    expect(data.init_point).toBe(checkoutUrl);
  });

  it("retorna 500 con mensaje si getSubscribeUrl lanza un error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockNoExistingSub();
    mockGetSubscribeUrl.mockRejectedValue(new Error("MP API error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST();
    const data = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(data.error).toBe("payment_error");
    expect(data.message).toBe("MP API error");
  });
});
