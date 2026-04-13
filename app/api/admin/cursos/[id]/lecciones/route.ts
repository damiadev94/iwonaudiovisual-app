import { z } from "zod";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

// Both fields must be present together or both absent
const videoFields = z
  .object({
    video_url: z.string().url().nullable().optional(),
    video_public_id: z
      .string()
      .regex(/^iwon\/lecciones\//, "El video debe pertenecer a la carpeta correcta")
      .nullable()
      .optional(),
  })
  .refine(
    (d) => {
      const hasUrl = d.video_url != null;
      const hasId = d.video_public_id != null;
      return hasUrl === hasId;
    },
    { message: "video_url y video_public_id deben enviarse juntos o no enviarse" }
  );

const createSchema = z
  .object({
    title: z
      .string()
      .min(3, "El título debe tener al menos 3 caracteres")
      .max(200, "El título no puede superar 200 caracteres"),
    description: z
      .string()
      .max(2000, "La descripción no puede superar 2000 caracteres")
      .nullable()
      .optional(),
    duration_minutes: z
      .number()
      .int()
      .positive()
      .max(600, "La duración máxima es 600 minutos")
      .nullable()
      .optional(),
    is_published: z.boolean().default(false),
  })
  .merge(videoFields);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id: courseId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Verify course exists
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  // Assign sort_order as MAX + 1 to avoid client-side race conditions and gaps
  const { data: maxRow } = await supabase
    .from("lessons")
    .select("sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = maxRow ? maxRow.sort_order + 1 : 0;

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({ ...parsed.data, course_id: courseId, sort_order })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/cursos/lecciones]", error.message);
    return NextResponse.json({ error: "Error al crear la lección" }, { status: 500 });
  }

  return NextResponse.json(lesson, { status: 201 });
}
