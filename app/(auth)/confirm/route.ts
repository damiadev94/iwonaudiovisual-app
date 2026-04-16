import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    console.warn("[confirm] Faltan parámetros token_hash o type");
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    console.error("[confirm] Error verificando OTP:", error.message);
    // Token expirado o inválido → redirigir a confirm-email para que pueda pedir otro
    if (error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("invalid")) {
      return NextResponse.redirect(`${origin}/confirm-email?error=token_expired`);
    }
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  // Confirmación de registro → ir al login con mensaje de éxito
  if (type === "signup" || type === "email") {
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }

  // Recuperación de contraseña → ir a la página de nueva contraseña
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/update-password`);
  }

  // Otros tipos (email_change, etc.) → dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
