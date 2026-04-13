import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/resend/client";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar input con el mismo schema que el formulario
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, full_name } = result.data;
    const admin = createAdminClient();

    // Crear usuario via admin.
    // email_confirm: true → Supabase permite login con email/password.
    // El acceso real a la plataforma queda bloqueado por profiles.email_confirmed = false
    // hasta que el usuario haga click en nuestro link de confirmación.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) {
      // Supabase retorna este mensaje cuando el email ya está registrado
      if (error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already been registered")) {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
      }
      console.error("[auth/register] Error creando usuario:", error.message);
      return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
    }

    // Generar token seguro (UUID v4 = 122 bits de entropía)
    const token = randomUUID();
    const now = new Date().toISOString();

    // El trigger handle_new_user ya creó el registro en profiles.
    // Guardamos el token y marcamos email_confirmed = false explícitamente.
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        email_confirmed: false,
        email_confirmation_token: token,
        email_confirmation_sent_at: now,
      })
      .eq("id", data.user.id);

    if (updateError) {
      // Usuario creado pero no pudimos guardar el token → eliminar usuario para evitar
      // cuentas huérfanas sin posibilidad de confirmar email.
      console.error("[auth/register] Error guardando token:", updateError.message);
      await admin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
    }

    // Enviar email de confirmación via Resend
    try {
      await sendConfirmationEmail(email, full_name, token);
    } catch (emailError) {
      // El email falló pero el usuario ya existe con token válido.
      // Log del error; el usuario puede usar "reenviar confirmación".
      console.error("[auth/register] Error enviando email:", emailError);
    }

    console.log(`[auth/register] Usuario registrado: ${email}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[auth/register] Error inesperado:", err);
    return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
  }
}
