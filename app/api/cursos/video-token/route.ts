import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId"); // Cloudflare Stream UID

  if (!publicId) {
    return NextResponse.json({ error: "Falta el publicId." }, { status: 400 });
  }

  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID;
  const privateKey = process.env.CLOUDFLARE_STREAM_PRIVATE_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!accountId || !keyId || !privateKey) {
    return NextResponse.json({ error: "Cloudflare credentials missing." }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Verify active subscription
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "Suscripción no activa.", status: "inactive" }, { status: 403 });
  }

  // Look up course directly by video_uid
  const { data: course, error: courseError } = await adminClient
    .from("courses")
    .select("release_at, is_published")
    .eq("video_uid", publicId)
    .maybeSingle();

  if (courseError || !course) {
    return NextResponse.json({ error: "Video no encontrado." }, { status: 404 });
  }

  if (!course.is_published) {
    return NextResponse.json({ error: "Contenido no disponible." }, { status: 404 });
  }

  if (course.release_at) {
    const releaseTime = new Date(course.release_at);
    if (releaseTime.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Contenido pendiente de estreno.", releaseAt: releaseTime.toISOString() },
        { status: 403 }
      );
    }
  }

  try {
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const expiresAt = Math.floor(Date.now() / 1000) + 7200;
    const token = jwt.sign(
      { sub: publicId, exp: expiresAt },
      formattedKey,
      { algorithm: "RS256", header: { alg: "RS256", kid: keyId } }
    );

    const signedUrl = `https://customer-${accountId}.cloudflarestream.com/${token}/iframe`;
    return NextResponse.json({ url: signedUrl, expiresAt });
  } catch (error: unknown) {
    log.error("[video-token] Error generando token", { error: String(error) });
    return NextResponse.json({ error: "No se pudo generar el acceso al video." }, { status: 500 });
  }
}
