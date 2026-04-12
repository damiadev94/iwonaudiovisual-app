import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscription } from "@/lib/mercadopago/subscription";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
    const result = await createSubscription(user.email!, user.id);

    if (!result.init_point) {
      console.error("[subscription/create] init_point missing:", JSON.stringify(result, null, 2));
      return NextResponse.json({ error: "payment_error" }, { status: 500 });
    }

    await adminClient.from("subscriptions").insert({
      user_id: user.id,
      mp_subscription_id: result.id,
      status: "pending",
      plan_amount: 9999,
      currency: "ARS",
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error("[subscription/create] MP Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "payment_error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
