import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

// POST /api/admin/portfolio — upload image and insert row
export async function POST(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const youtube_link = formData.get("youtube_link") as string;
  const nombre_tema = formData.get("nombre_tema") as string;
  const nombre_artista = formData.get("nombre_artista") as string;

  if (!file || !youtube_link || !nombre_tema || !nombre_artista) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Upload image using service role (bypasses RLS)
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("portfolio")
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Error al subir imagen: " + uploadError.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("portfolio").getPublicUrl(fileName);

  // Insert portfolio row
  const { data, error } = await admin
    .from("portfolio")
    .insert({ url_portada: publicUrl, youtube_link, nombre_tema, nombre_artista })
    .select()
    .single();

  if (error) {
    // Clean up uploaded file if DB insert fails
    await admin.storage.from("portfolio").remove([fileName]);
    return NextResponse.json(
      { error: "Error al guardar: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: data });
}

// DELETE /api/admin/portfolio?id=xxx — delete row and image
export async function DELETE(request: NextRequest) {
  const user = await assertAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch item to get the filename
  const { data: item } = await admin
    .from("portfolio")
    .select("url_portada")
    .eq("id", id)
    .single();

  if (item) {
    const fileName = item.url_portada.split("/").pop();
    if (fileName) {
      await admin.storage.from("portfolio").remove([fileName]);
    }
  }

  const { error } = await admin.from("portfolio").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
