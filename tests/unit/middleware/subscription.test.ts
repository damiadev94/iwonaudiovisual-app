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
    (createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    });

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: false,
      status: 403,
    });
  });

  // 🟢 3. Con suscripción activa
  it("should allow access if subscription is active", async () => {
    (createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: "active" },
      }),
    });

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: true,
    });
  });

  // 🟡 4. Suscripción pending (permitida)
  it("should allow access if subscription is pending", async () => {
    (createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { status: "pending" },
      }),
    });

    const result = await checkUserAccess("user-1");

    expect(result).toEqual({
      allowed: true,
    });
  });
});