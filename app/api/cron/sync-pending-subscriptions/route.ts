import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";

export const dynamic = "force-dynamic";

/**
 * Cron job que sincroniza suscripciones en estado 'pending' contra la API de MercadoPago.
 *
 * Invocado por Vercel Cron Jobs cada 5 minutos (ver vercel.json).
 * Vercel inyecta automáticamente: Authorization: Bearer <CRON_SECRET>
 *
 * Solo procesa suscripciones creadas hace más de 5 minutos para evitar
 * colisiones con el flujo de la página de éxito que también sincroniza.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: pendingSubs, error: fetchError } = await adminClient
    .from("subscriptions")
    .select("id, user_id, mp_preapproval_id, created_at")
    .eq("status", "pending")
    .not("mp_preapproval_id", "is", null)
    .lt("created_at", fiveMinutesAgo);

  if (fetchError) {
    console.error("[cron/sync-pending] Error fetching pending subscriptions:", fetchError.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const results: { id: string; action: string; mp_status?: string; error?: string }[] = [];

  for (const sub of pendingSubs ?? []) {
    const timestamp = new Date().toISOString();
    try {
      const mpData = await getSubscriptionStatus(sub.mp_preapproval_id);
      const mpStatus = mpData.status ?? "unknown";

      if (mpStatus === "authorized") {
        await adminClient
          .from("subscriptions")
          .update({ status: "active" })
          .eq("id", sub.id);
        console.log(`[cron/sync-pending] ${timestamp} subscription=${sub.id} user=${sub.user_id} → active`);
        results.push({ id: sub.id, action: "activated" });
      } else if (mpStatus === "cancelled" || mpStatus === "rejected") {
        await adminClient
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", sub.id);
        console.log(`[cron/sync-pending] ${timestamp} subscription=${sub.id} user=${sub.user_id} → cancelled (mp_status=${mpStatus})`);
        results.push({ id: sub.id, action: "cancelled", mp_status: mpStatus });
      } else {
        console.log(`[cron/sync-pending] ${timestamp} subscription=${sub.id} still pending (mp_status=${mpStatus})`);
        results.push({ id: sub.id, action: "skipped", mp_status: mpStatus });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[cron/sync-pending] ${timestamp} subscription=${sub.id} error:`, message);
      results.push({ id: sub.id, action: "error", error: message });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
