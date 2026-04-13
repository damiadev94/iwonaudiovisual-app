import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminGuardOk = { ok: true; userId: string };
type AdminGuardFail = { ok: false; response: NextResponse };
export type AdminGuardResult = AdminGuardOk | AdminGuardFail;

/**
 * Verifies the request comes from an authenticated admin.
 *
 * - Uses the session cookie to validate the user (no header trust).
 * - Checks role in the DB via admin client (bypasses RLS).
 *
 * Use this at the top of every /api/admin/* route handler.
 * The middleware provides early rejection, but this is the authoritative check.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}
