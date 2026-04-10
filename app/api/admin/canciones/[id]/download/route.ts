import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verificar rol admin
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const { data: submission } = await adminClient
      .from("song_submissions")
      .select("file_path, file_name")
      .eq("id", id)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Generar URL firmada valida por 1 hora
    const { data: signedUrl, error } = await adminClient.storage
      .from("canciones")
      .createSignedUrl(submission.file_path, 3600, {
        download: submission.file_name,
      });

    if (error || !signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Error al generar la URL de descarga" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
