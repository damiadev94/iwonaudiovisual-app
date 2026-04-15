import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkUserAccess } from "@/lib/supabase/middleware";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";

describe("checkUserAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 🔴 1. Sin usuario
  it("should deny access if no userId", async () => {
    const result = await checkUserAccess(null);

    expect(result).toEqual({
      allowed: false,
      status: 401,
    });
  });

  // 🔴 2. Sin suscripción
  it("should deny access if no active subscription", async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: false,
      status: 403,
    });
  });

  // 🟢 3. Con suscripción activa
  it("should allow access if subscription is active", async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: "active" },
      }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: true,
    });
  });

  // 🟡 4. Suscripción pending (permitida)
  it("should allow access if subscription is pending", async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: "pending" },
      }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: true,
    });
  });
});
