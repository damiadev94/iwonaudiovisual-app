import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

const createSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede superar 200 caracteres"),
  description: z
    .string()
    .max(2000, "La descripción no puede superar 2000 caracteres")
    .nullable()
    .optional(),
  category: z.enum([
    "negocio",
    "audiovisual",
    "marketing",
    "publicidad",
    "estrategias",
  ]),
  thumbnail_url: z.string().url().nullable().optional(),
  thumbnail_public_id: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  video_uid: z.string().nullable().optional(),
  release_at: z.string().datetime().nullable().optional(),
  is_published: z.boolean().default(false),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/admin/cursos]", error.message);
    return NextResponse.json({ error: "Error al obtener los cursos" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { title } = parsed.data;
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const supabase = createAdminClient();

  // Check if slug exists
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

  // Get next sort order
  const { data: maxRow } = await supabase
    .from("courses")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = maxRow ? maxRow.sort_order + 1 : 0;

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      ...parsed.data,
      slug: finalSlug,
      sort_order,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/cursos]", error.message);
    return NextResponse.json(
      { error: "Error al crear el curso", details: error.message },
      { status: 500 }
    );
  }

  revalidatePath("/cursos");
  return NextResponse.json(course, { status: 201 });
}
