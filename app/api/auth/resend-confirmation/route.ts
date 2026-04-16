import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase tiene su propio rate limit para reenvíos; no necesitamos implementar el nuestro.
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.toLowerCase().trim(),
    });

    if (error) {
      // No exponemos si el email existe o no
      console.error("[resend-confirmation] Error:", error.message);
    }

    // Siempre respondemos OK para no revelar si el email está registrado
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[resend-confirmation] Error inesperado:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
