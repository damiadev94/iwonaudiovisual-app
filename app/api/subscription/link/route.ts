import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { preapproval_id } = await request.json();
    console.log("[subscription/link] Iniciando vinculación para ID:", preapproval_id);

    if (!preapproval_id) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 });
    }

    // Consultar el estado real en Mercado Pago
    const mpData = await getSubscriptionStatus(preapproval_id);
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

    const subData = {
      user_id: user.id,
      mp_subscription_id: preapproval_id,
      mp_preapproval_id: preapproval_id,
      status,
      plan_amount: (mpData as any).auto_recurring?.transaction_amount ?? 1000,
      currency: "ARS",
      current_period_start: mpData.date_created,
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
  } catch (error: any) {
    console.error("[subscription/link] Error FATAL:", error);
    return NextResponse.json({ error: "link_error", message: error.message }, { status: 500 });
  }
}


