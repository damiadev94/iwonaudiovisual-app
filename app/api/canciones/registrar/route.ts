import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancionRegistrarSchema } from "@/lib/validations/cancion";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verificar suscripcion activa o pendiente
    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json(
        { error: "Necesitas una suscripcion activa" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = cancionRegistrarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { file_path, file_name, file_size, file_type, notes, song_title, genre } = parsed.data;

    // Verificar que la ruta del archivo pertenece al usuario
    if (!file_path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Ruta de archivo invalida" },
        { status: 400 }
      );
    }

    const { data, error } = await adminClient
      .from("song_submissions")
      .insert({
        user_id: user.id,
        file_path,
        file_name,
        file_size: file_size ?? null,
        file_type: file_type ?? null,
        notes: notes ?? null,
        song_title,
        genre,
      })
      .select()
      .single();

    if (error) {
      console.error("Song submission DB error:", error);
      return NextResponse.json(
        { error: "Error al guardar el registro" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Song submission error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
