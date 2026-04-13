import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  if (id === guard.userId) {
    return NextResponse.json(
      { error: "No puedes desactivar tu propia cuenta" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", id)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const newValue = !profile.is_active;

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: newValue })
    .eq("id", id);

  if (error) {
    console.error("[PATCH /api/admin/usuarios/toggle]", error.message);
    return NextResponse.json(
      { error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, is_active: newValue });
}
