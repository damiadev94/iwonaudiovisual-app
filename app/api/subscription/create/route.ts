import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscription } from "@/lib/mercadopago/subscription";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
    }

    // Check if already has active subscription
    const adminClient = createAdminClient();
    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existing) {
      return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
    }

    // Create MP subscription
    const result = await createSubscription(user.email!, user.id);

    // Store pending subscription
    await adminClient.from("subscriptions").insert({
      user_id: user.id,
      mp_subscription_id: result.id,
      status: "pending",
      plan_amount: 9999,
      currency: "ARS",
    });

    // Redirect to MP checkout
    if (result.init_point) {
      return NextResponse.redirect(result.init_point);
    }

    console.error("[subscription/create] init_point missing. Full MP result:", JSON.stringify(result, null, 2));
    return NextResponse.redirect(new URL("/dashboard?error=payment", process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error("[subscription/create] Error:", error instanceof Error ? { message: error.message, stack: error.stack, cause: (error as any).cause } : error);
    return NextResponse.redirect(new URL("/dashboard?error=payment", process.env.NEXT_PUBLIC_APP_URL));
  }
}
