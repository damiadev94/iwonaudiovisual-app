import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription } from "@/lib/mercadopago/subscription";
import { cancelSubscriptionSchema } from "@/lib/validations/subscription";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = cancelSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("*")
      .eq("id", result.data.subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "Suscripcion no encontrada" }, { status: 404 });
    }

    // Cancel in MP best-effort — a network/API failure must not prevent DB update
    if (subscription.mp_preapproval_id) {
      try {
        await cancelSubscription(subscription.mp_preapproval_id);
      } catch (mpError) {
        console.error("Cancel subscription: MP cancellation failed, proceeding with DB update", {
          subscriptionId: subscription.id,
          mpPreapprovalId: subscription.mp_preapproval_id,
          error: mpError instanceof Error ? mpError.message : String(mpError),
        });
      }
    }

    // Always update DB — this is the authoritative access gate
    await adminClient
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Error al cancelar" }, { status: 500 });
  }
}
