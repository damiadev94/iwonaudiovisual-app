import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("status, mp_preapproval_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Si la DB dice "pending" pero ya tenemos el ID de MP, consultamos directamente
  // a Mercado Pago para ver si ya fue autorizada. Esto resuelve la ventana de tiempo
  // entre que MP redirige al usuario y que el webhook llega a actualizar la DB.
  if (subscription?.status === "pending" && subscription?.mp_preapproval_id) {
    try {
      const mpData = await getSubscriptionStatus(subscription.mp_preapproval_id);
      if (mpData.status === "authorized") {
        // Condición doble: solo actualiza si sigue en pending para evitar
        // conflicto con el webhook que puede llegar simultáneamente.
        await adminClient
          .from("subscriptions")
          .update({ status: "active" })
          .eq("user_id", user.id)
          .eq("status", "pending");
        return NextResponse.json({ status: "active" });
      }
    } catch (err) {
      log.warn("[subscription/status] Fallo consulta MP, usando DB", { error: String(err) });
    }
  }

  return NextResponse.json({ status: subscription?.status ?? "none" });
}
