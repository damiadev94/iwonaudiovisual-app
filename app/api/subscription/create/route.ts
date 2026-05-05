import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionForUser } from "@/lib/mercadopago/subscription";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (existing) {
    return NextResponse.json({ redirect: "/dashboard" });
  }

  try {
    const { preapproval_id, init_point } = await createSubscriptionForUser(
      user.id,
      user.email!
    );

    // Guardamos el mp_preapproval_id desde el inicio. Esto permite al webhook,
    // al cron de sync y al layout encontrar la sub aunque MP no incluya el
    // preapproval_id en el back_url ni el external_reference en sus respuestas.
    await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        mp_preapproval_id: preapproval_id,
        mp_subscription_id: preapproval_id,
        status: "pending",
        plan_amount: 14999,
        currency: "ARS",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ init_point });
  } catch (error: any) {
    const errorDetails = error.response?.data || error.message || JSON.stringify(error);
    log.error("[subscription/create] MP Error", { error: errorDetails });
    return NextResponse.json({ error: "payment_setup_failed" }, { status: 500 });
  }
}
