import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, full_name } = result.data;
    const admin = createAdminClient();

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already been registered")
      ) {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
      }
      console.error("[auth/register] Error creando usuario:", error.message);
      return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
    }

    // admin.createUser no envía el email de confirmación automáticamente.
    // Hay que pedírselo explícitamente con resend.
    const supabase = await createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      console.error("[auth/register] Error enviando email de confirmación:", resendError.message);
      // El usuario fue creado igual; no bloqueamos el registro por esto.
    }

    console.log(`[auth/register] Usuario registrado: ${email}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[auth/register] Error inesperado:", err);
    return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
  }
}
