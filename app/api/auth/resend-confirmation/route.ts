import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/resend/client";

// Tiempo mínimo entre reenvíos para evitar spam: 60 segundos
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Buscar perfil por email
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, email_confirmed, email_confirmation_sent_at")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Respuesta genérica para no revelar si el email existe o no
    if (!profile || profile.email_confirmed) {
      return NextResponse.json({ ok: true });
    }

    // Rate limiting: no reenviar si el último email fue hace menos de 60s
    if (profile.email_confirmation_sent_at) {
      const lastSent = new Date(profile.email_confirmation_sent_at).getTime();
      if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        return NextResponse.json(
          { error: "Esperá 1 minuto antes de pedir otro email" },
          { status: 429 }
        );
      }
    }

    // Generar nuevo token (invalida el anterior al reemplazarlo)
    const token = randomUUID();

    await admin
      .from("profiles")
      .update({
        email_confirmation_token: token,
        email_confirmation_sent_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    await sendConfirmationEmail(email, profile.full_name ?? "", token);

    console.log(`[resend-confirmation] Email reenviado a: ${email}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[resend-confirmation] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
