import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { generateSignedVideoUrl } from "@/lib/cloudflare-stream";

export async function GET(request: Request) {
  const start = performance.now();
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);

  const response = await handleVideoToken(request, log);

  log.metric({
    path: "/api/cursos/video-token",
    status: response.status,
    durationMs: Math.round(performance.now() - start),
  });

  return response;
}

async function handleVideoToken(
  request: Request,
  log: ReturnType<typeof logger.withRequestId>
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId"); // Cloudflare Stream UID

  if (!publicId) {
    return NextResponse.json({ error: "Falta el publicId." }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    log.warn("[video-token] Sesión Inválida", { authError: authError?.message });
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Check if user is an admin to bypass subscription requirements
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    // Verify active subscription
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!subscription) {
      log.info("[video-token] Acceso denegado: sin suscripcion activa", { userId: user.id });
      return NextResponse.json({ error: "Suscripción no activa.", status: "inactive" }, { status: 403 });
    }
  }

  // Look up course directly by video_uid
  const { data: course, error: courseError } = await adminClient
    .from("courses")
    .select("release_at, is_published")
    .eq("video_uid", publicId)
    .maybeSingle();

  if (courseError || !course) {
    log.warn("[video-token] Video no encontrado", { publicId, dbError: courseError?.message });
    return NextResponse.json({ error: "Video no encontrado." }, { status: 404 });
  }

  if (!course.is_published) {
    log.warn("[video-token] Video no publicado", { publicId });
    return NextResponse.json({ error: "Contenido no disponible." }, { status: 404 });
  }

  if (course.release_at) {
    const releaseTime = new Date(course.release_at);
    if (releaseTime.getTime() > Date.now()) {
      log.info("[video-token] Video pendiente de estreno", { publicId, releaseAt: releaseTime.toISOString() });
      return NextResponse.json(
        { error: "Contenido pendiente de estreno.", releaseAt: releaseTime.toISOString() },
        { status: 403 }
      );
    }
  }

  const result = await generateSignedVideoUrl(publicId);

  if (!result.ok) {
    if (result.reason === "credentials_missing") {
      log.error("[video-token] Credenciales Cloudflare ausentes", { accountId: !!accountId });
      return NextResponse.json({ error: "Cloudflare credentials missing." }, { status: 500 });
    }
    log.error("[video-token] Error generando token", { detail: result.detail });
    return NextResponse.json(
      { error: "No se pudo generar el acceso al video.", details: result.detail },
      { status: 500 }
    );
  }

  log.info("[video-token] Token generado exitosamente", { userId: user.id, publicId, expiresAt: result.expiresAt });
  return NextResponse.json({ url: result.url, expiresAt: result.expiresAt });
}
