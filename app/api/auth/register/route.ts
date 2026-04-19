import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";
import { ratelimit } from "@/lib/redis/client";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "TOO_MANY_REQUESTS" }, { status: 429 });
      }
    } catch {
      // Si Redis no está disponible, permitimos la request (fail-open)
    }

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

    const { data: created, error } = await admin.auth.admin.createUser({
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
      log.error("[auth/register] Error creando usuario", { msg: error.message });
      return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
    }

    // Garantizar que el perfil existe. El trigger handle_new_user debería haberlo
    // creado, pero si falló silenciosamente lo creamos aquí con ignoreDuplicates.
    const { error: profileError } = await admin
      .from("profiles")
      .upsert(
        { id: created.user.id, email, full_name: full_name ?? "" },
        { onConflict: "id", ignoreDuplicates: true }
      );

    if (profileError) {
      log.error("[auth/register] Error creando perfil, rollback", { userId: created.user.id, msg: profileError.message });
      await admin.auth.admin.deleteUser(created.user.id);
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
      log.warn("[auth/register] Error enviando email de confirmacion", { msg: resendError.message });
    }

    log.info("[auth/register] Usuario registrado", { email });
    return NextResponse.json({ ok: true });

  } catch (err) {
    log.error("[auth/register] Error inesperado", { error: String(err) });
    return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
  }
}
