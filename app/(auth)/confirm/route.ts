import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Token expira a las 24 horas de ser emitido
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token = searchParams.get("token");

  // Token ausente o malformado
  if (!token || token.length < 32) {
    console.warn("[confirm] Token inválido o ausente");
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  const admin = createAdminClient();

  // Buscar perfil por token (el index hace esta consulta eficiente)
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, email_confirmation_sent_at, email_confirmed")
    .eq("email_confirmation_token", token)
    .maybeSingle();

  if (error || !profile) {
    // Log del error completo para diagnóstico en consola del servidor
    if (error) {
      console.error("[confirm] Error en query:", error.message, "| code:", error.code);
    } else {
      console.warn("[confirm] Token no encontrado en DB:", token.slice(0, 8) + "...");
    }
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  // El usuario ya confirmó antes (doble click en el link, por ejemplo)
  if (profile.email_confirmed) {
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }

  // Verificar que el token no haya expirado
  const sentAt = new Date(profile.email_confirmation_sent_at!).getTime();
  if (Date.now() - sentAt > TOKEN_TTL_MS) {
    console.warn(`[confirm] Token expirado para: ${profile.email}`);
    return NextResponse.redirect(
      `${origin}/confirm-email?email=${encodeURIComponent(profile.email)}&error=token_expired`
    );
  }

  // Confirmar email: marcar como confirmado y limpiar el token
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      email_confirmed: true,
      email_confirmation_token: null,
      email_confirmation_sent_at: null,
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("[confirm] Error actualizando perfil:", updateError.message);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }

  console.log(`[confirm] Email confirmado: ${profile.email}`);

  // Redirigir al login con mensaje de éxito para que el usuario pueda ingresar
  return NextResponse.redirect(`${origin}/login?confirmed=true`);
}
