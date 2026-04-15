import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 🔥 Lógica pura (testeable)
 */
export async function checkUserAccess(userId: string | null) {
  if (!userId) {
    return { allowed: false, status: 401 };
  }

  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .in("status", ["active", "pending"])
    .maybeSingle();

  if (!sub) {
    return { allowed: false, status: 403 };
  }

  return { allowed: true };
}

/**
 * 🌐 Middleware HTTP
 */
export async function middleware(_request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await checkUserAccess(user?.id ?? null);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: result.status }
    );
  }

  return NextResponse.next();
}