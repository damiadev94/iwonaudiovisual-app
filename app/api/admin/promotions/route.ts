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

const createSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  type: z.enum(PROMOTION_TYPES),
  // Accept ISO strings; datetime() validates format strictly
  starts_at: z.string().datetime({ message: "starts_at debe ser una fecha ISO válida" }),
  ends_at: z.string().datetime({ message: "ends_at debe ser una fecha ISO válida" }),
});

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/admin/promotions]", error.message);
    return NextResponse.json(
      { error: "Error al obtener las promociones" },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Promotion[]);
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

  // Validate that ends_at > starts_at at the application level too —
  // the DB constraint would catch it, but this gives a cleaner error message.
  if (new Date(parsed.data.ends_at) <= new Date(parsed.data.starts_at)) {
    return NextResponse.json(
      { error: "ends_at debe ser posterior a starts_at" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: promotion, error } = await supabase
    .from("promotions")
    .insert({
      ...parsed.data,
      created_by: guard.userId,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/promotions]", error.message);
    return NextResponse.json(
      { error: "Error al crear la promoción", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(promotion as Promotion, { status: 201 });
}
