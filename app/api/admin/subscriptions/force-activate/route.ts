import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";

const STATUS_MAP: Record<string, string> = {
  authorized: "active",
  paused: "paused",
  cancelled: "cancelled",
  pending: "pending",
};

/**
 * POST /api/admin/subscriptions/force-activate
 *
 * Fuerza la verificación de una suscripción contra la API de MercadoPago
 * y actualiza el estado en la DB con lo que MP responda.
 *
 * Body: { subscription_id: string }
 *
 * Útil cuando el webhook nunca llegó y el cron no alcanzó a resolverlo,
 * o para resolver casos individuales reportados por usuarios sin tocar la DB directamente.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const subscriptionId = body?.subscription_id as string | undefined;

  if (!subscriptionId) {
    return NextResponse.json({ error: "subscription_id es requerido" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: sub, error: fetchError } = await adminClient
    .from("subscriptions")
    .select("id, user_id, mp_preapproval_id, status")
    .eq("id", subscriptionId)
    .single();

  if (fetchError || !sub) {
    return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
  }

  if (!sub.mp_preapproval_id) {
    return NextResponse.json(
      { error: "Esta suscripción no tiene mp_preapproval_id — no se puede verificar contra MP" },
      { status: 422 }
    );
  }

  let mpStatus: string;
  try {
    const mpData = await getSubscriptionStatus(sub.mp_preapproval_id);
    mpStatus = mpData.status ?? "unknown";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/force-activate] Error al consultar MP:", message);
    return NextResponse.json(
      { error: "No se pudo contactar a MercadoPago", details: message },
      { status: 502 }
    );
  }

  const newStatus = STATUS_MAP[mpStatus] ?? "pending";

  const { error: updateError } = await adminClient
    .from("subscriptions")
    .update({ status: newStatus })
    .eq("id", sub.id);

  if (updateError) {
    console.error("[admin/force-activate] Error al actualizar DB:", updateError.message);
    return NextResponse.json({ error: "Error al actualizar la base de datos" }, { status: 500 });
  }

  console.log(
    `[admin/force-activate] admin=${guard.userId} subscription=${sub.id} user=${sub.user_id} ${sub.status} → ${newStatus} (mp_status=${mpStatus})`
  );

  return NextResponse.json({
    subscription_id: sub.id,
    previous_status: sub.status,
    new_status: newStatus,
    mp_status: mpStatus,
  });
}
