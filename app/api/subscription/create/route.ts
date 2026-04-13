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
    const init_point = await getSubscribeUrl();
    return NextResponse.json({ init_point });
  } catch (error: any) {
    console.error("[subscription/create] MP Error:", error);
    return NextResponse.json(
      { error: "payment_error", message: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
