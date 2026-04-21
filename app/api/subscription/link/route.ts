import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus, findSubscriptionByExternalRef } from "@/lib/mercadopago/subscription";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let preapproval_id: string | undefined = body.preapproval_id;
    console.log("[subscription/link] Iniciando vinculación para ID:", preapproval_id ?? "(no ID — buscando por external_ref)");

    let mpData: { status?: string; id?: string; auto_recurring?: { transaction_amount?: number }; date_created?: string };

    if (preapproval_id) {
      // Flujo normal: MP nos pasó el preapproval_id en la URL de retorno
      mpData = await getSubscriptionStatus(preapproval_id);
    } else {
      // Flujo de plan: MP no devuelve el ID en la URL — buscamos por external_reference (userId)
      console.log("[subscription/link] Buscando suscripción por external_reference (userId):", user.id);
      const found = await findSubscriptionByExternalRef(user.id);
      if (!found) {
        console.warn("[subscription/link] No se encontró suscripción en MP para el usuario", user.id);
        return NextResponse.json({ error: "no_subscription_found", message: "No se encontró ninguna suscripción asociada a tu cuenta en Mercado Pago." }, { status: 404 });
      }
      mpData = found;
      preapproval_id = found.id;
    }

    console.log("[subscription/link] Datos recibidos de MP:", JSON.stringify(mpData));

    const statusMap: Record<string, string> = {
      authorized: "active",
      paused: "paused",
      cancelled: "cancelled",
      pending: "pending",
    };

    const status = statusMap[mpData.status || ""] || "pending";
    console.log("[subscription/link] Estado mapeado:", status);

    // Vincular al usuario en nuestra DB usando Admin Client
    const adminClient = createAdminClient();
    
    // Primero buscamos si ya existe una suscripción para este usuario
    const { data: existingSub } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    type MPPreApprovalData = {
      status?: string;
      date_created?: string;
      auto_recurring?: { transaction_amount?: number };
    };
    const mpTyped = mpData as MPPreApprovalData;

    const subData = {
      user_id: user.id,
      mp_subscription_id: preapproval_id,
      mp_preapproval_id: preapproval_id,
      status,
      plan_amount: mpTyped.auto_recurring?.transaction_amount ?? 1000,
      currency: "ARS",
      current_period_start: mpTyped.date_created,
    };

    let result;
    if (existingSub) {
      console.log("[subscription/link] Actualizando suscripción existente:", existingSub.id);
      result = await adminClient
        .from("subscriptions")
        .update(subData)
        .eq("id", existingSub.id)
        .select();
    } else {
      console.log("[subscription/link] Insertando suscripción nueva");
      result = await adminClient
        .from("subscriptions")
        .insert(subData)
        .select();
    }

    if (result.error) {
      console.error("[subscription/link] Error en DB:", result.error);
      throw result.error;
    }

    console.log("[subscription/link] Operación exitosa en DB");
    return NextResponse.json({ success: true, status });
  } catch (error: unknown) {
    console.error("[subscription/link] Error FATAL:", error);
    return NextResponse.json({ error: "link_error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}


