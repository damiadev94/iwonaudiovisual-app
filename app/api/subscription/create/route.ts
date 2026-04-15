import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscribeUrl } from "@/lib/mercadopago/subscription";

export async function POST() {
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
    const init_point = await getSubscribeUrl(user.id, user.email!);

    // Pre-crear la suscripción en estado pendiente para que la app lo reconozca
    await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        status: "pending",
        plan_amount: 14999,
        currency: "ARS",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ init_point });
  } catch (error: unknown) {
    console.error("[subscription/create] MP Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "payment_error", message },
      { status: 500 }
    );
  }
}
