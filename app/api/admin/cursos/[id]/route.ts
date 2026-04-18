import { z } from "zod";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

const updateSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200)
    .optional(),
  description: z
    .string()
    .max(2000)
    .nullable()
    .optional(),
  category: z.enum([
    "negocio",
    "audiovisual",
    "marketing",
    "publicidad",
    "estrategias",
  ]).optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  thumbnail_public_id: z.string().nullable().optional(),
  release_at: z.string().datetime().nullable().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: course, error } = await supabase
    .from("courses")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/admin/cursos]", error.message);
    return NextResponse.json({ error: "Error al actualizar el curso" }, { status: 500 });
  }

  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: course } = await supabase
    .from("courses")
    .select("thumbnail_public_id")
    .eq("id", id)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  // Delete thumbnail from Supabase Storage if present
  if (course.thumbnail_public_id) {
    await supabase.storage
      .from("thumbnails")
      .remove([course.thumbnail_public_id])
      .catch((err) => {
        console.error("[DELETE course] Storage thumbnail cleanup failed:", err);
      });
  }

  // Delete course (cascades to lessons and progress)
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/cursos]", error.message);
    return NextResponse.json({ error: "Error al eliminar el curso" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
