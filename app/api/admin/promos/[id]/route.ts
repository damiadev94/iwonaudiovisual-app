import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

const BUCKET = "promo-covers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch cover path before deleting
  const { data: promo } = await supabase
    .from("promos")
    .select("cover_image_path")
    .eq("id", id)
    .single();

  // Delete promo (cascade removes promo_bookings)
  const { error } = await supabase.from("promos").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/promos/:id]", error.message);
    return NextResponse.json({ error: "Error al eliminar la promo" }, { status: 500 });
  }

  // Remove cover from storage after DB delete succeeds
  if (promo?.cover_image_path) {
    await supabase.storage.from(BUCKET).remove([promo.cover_image_path]);
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Cuerpo requerido" }, { status: 400 });
  }

  const allowed = [
    "title", "description", "cover_image_path", "original_price",
    "price", "whatsapp_number", "max_slots", "status",
    "available_from", "available_until",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("promos").update(update).eq("id", id);

  if (error) {
    console.error("[PATCH /api/admin/promos/:id]", error.message);
    return NextResponse.json({ error: "Error al actualizar la promo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
