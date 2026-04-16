import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET /api/admin/subscriptions/pending-alert
 *
 * Devuelve todas las suscripciones que llevan más de 24 horas en estado 'pending'.
 * Indica que el webhook de MercadoPago nunca llegó o está mal configurado.
 *
 * Solo accesible para admins. Útil para monitoreo manual o alertas programadas.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const adminClient = createAdminClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await adminClient
    .from("subscriptions")
    .select("id, user_id, mp_preapproval_id, status, created_at, profiles(email, full_name)")
    .eq("status", "pending")
    .lt("created_at", twentyFourHoursAgo)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin/subscriptions/pending-alert] DB error:", error.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({
    count: data?.length ?? 0,
    subscriptions: data ?? [],
    generated_at: new Date().toISOString(),
  });
}
