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

const updateSchema = z
  .object({
    title: z
      .string()
      .min(3)
      .max(200, "El título no puede superar 200 caracteres")
      .optional(),
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
    sort_order: z.number().int().min(0).optional(),
    is_published: z.boolean().optional(),
  })
  .merge(videoFields);

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

  // Prevent no-op updates
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: lesson, error } = await supabase
    .from("lessons")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/admin/lecciones]", error.message);
    return NextResponse.json({ error: "Error al actualizar la lección" }, { status: 500 });
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch before delete to clean up Cloudinary asset
  const { data: lesson } = await supabase
    .from("lessons")
    .select("video_public_id")
    .eq("id", id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 });
  }

  if (lesson.video_public_id) {
    try {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;
      
      if (accountId && apiToken) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${lesson.video_public_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error("[DELETE lesson] Cloudflare cleanup failed:", err);
    }
  }

  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/lecciones]", error.message);
    return NextResponse.json({ error: "Error al eliminar la lección" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
