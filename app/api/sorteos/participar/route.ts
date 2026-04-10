import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const participateSchema = z.object({
  raffle_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const result = participateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check raffle is active
    const { data: raffle } = await adminClient
      .from("raffles")
      .select("status")
      .eq("id", result.data.raffle_id)
      .single();

    if (!raffle || raffle.status !== "active") {
      return NextResponse.json({ error: "Sorteo no disponible" }, { status: 400 });
    }

    // Check active subscription
    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Necesitas una suscripcion activa" }, { status: 403 });
    }

    // Check if already entered
    const { data: existing } = await adminClient
      .from("raffle_entries")
      .select("id")
      .eq("raffle_id", result.data.raffle_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Ya estas participando" }, { status: 400 });
    }

    // Create entry
    const { error } = await adminClient.from("raffle_entries").insert({
      raffle_id: result.data.raffle_id,
      user_id: user.id,
    });

    if (error) {
      return NextResponse.json({ error: "Error al participar" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Raffle participate error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
