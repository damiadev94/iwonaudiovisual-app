import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { seleccionApplicationSchema } from "@/lib/validations/seleccion";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Find the current open selection if no selection_id provided
    const adminClient = createAdminClient();

    let selectionId = body.selection_id;
    if (!selectionId) {
      const { data: openSelection } = await adminClient
        .from("selections")
        .select("id")
        .eq("status", "open")
        .single();

      if (!openSelection) {
        return NextResponse.json({ error: "No hay convocatoria abierta" }, { status: 400 });
      }
      selectionId = openSelection.id;
    }

    const result = seleccionApplicationSchema.safeParse({
      ...body,
      selection_id: selectionId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Check if already applied
    const { data: existing } = await adminClient
      .from("selection_applications")
      .select("id")
      .eq("selection_id", selectionId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Ya aplicaste a esta oleada" }, { status: 400 });
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

    // Create application
    const { error } = await adminClient.from("selection_applications").insert({
      selection_id: selectionId,
      user_id: user.id,
      demo_url: result.data.demo_url,
      demo_description: result.data.demo_description,
      tracks_count: result.data.tracks_count,
    });

    if (error) {
      return NextResponse.json({ error: "Error al crear la aplicacion" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Selection application error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
