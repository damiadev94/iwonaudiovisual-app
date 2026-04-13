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

    if (!preapproval_id) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 });
    }

    // Consultar el estado real en Mercado Pago
    const mpData = await getSubscriptionStatus(preapproval_id);

    const statusMap: Record<string, string> = {
      authorized: "active",
      paused: "paused",
      cancelled: "cancelled",
      pending: "pending",
    };

    const status = statusMap[mpData.status || ""] || "pending";

    // Vincular al usuario en nuestra DB usando Admin Client
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        mp_subscription_id: preapproval_id,
        mp_preapproval_id: preapproval_id,
        status,
        plan_amount: (mpData as any).auto_recurring?.transaction_amount ?? 9999,
        currency: "ARS",
        current_period_start: mpData.date_created,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("[subscription/link] Error:", error);
    return NextResponse.json({ error: "link_error" }, { status: 500 });
  }
}
