import { z } from "zod";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import type { Promotion } from "@/types/database";

const PROMOTION_TYPES = [
  "full_access",
  "courses",
  "raffles",
  "selections",
  "promos",
] as const;

// All fields optional for partial updates
const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(PROMOTION_TYPES).optional(),
  starts_at: z
    .string()
    .datetime({ message: "starts_at debe ser una fecha ISO válida" })
    .optional(),
  ends_at: z
    .string()
    .datetime({ message: "ends_at debe ser una fecha ISO válida" })
    .optional(),
  access_until: z
    .string()
    .datetime({ message: "access_until debe ser una fecha ISO válida" })
    .nullable()
    .optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Sin campos para actualizar" },
      { status: 400 }
    );
  }

  // If both dates are provided in this request, validate range client-side
  // for a better error message (DB constraint covers the rest).
  const { starts_at, ends_at } = parsed.data;
  if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at)) {
    return NextResponse.json(
      { error: "ends_at debe ser posterior a starts_at" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: promotion, error } = await supabase
    .from("promotions")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // PGRST116 = no rows returned → id doesn't exist
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }
    // 23514 = check_violation → ends_at <= starts_at (partial update hitting DB constraint)
    if (error.code === "23514") {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }
    console.error("[PATCH /api/admin/promotions/:id]", error.message);
    return NextResponse.json(
      { error: "Error al actualizar la promoción", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(promotion as Promotion);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("promotions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/promotions/:id]", error.message);
    return NextResponse.json(
      { error: "Error al eliminar la promoción" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
