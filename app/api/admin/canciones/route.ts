import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("song_submissions")
    .select("*, profiles(artist_name, email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/canciones GET] Error fetching submissions:", error.message);
    return NextResponse.json({ error: "Error al obtener canciones" }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const { id, status } = body ?? {};

  if (!id || !status) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("song_submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[admin/canciones PATCH] Error al actualizar:", error.message);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
