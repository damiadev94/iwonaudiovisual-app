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
    log.error("[video-token] Credenciales Cloudflare ausentes");
    return NextResponse.json(
      { error: `Cloudflare credentials missing. acc: ${!!accountId}, key: ${!!keyId}, priv: ${!!privateKey}` },
      { status: 500 }
    );
  }

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

  try {
    let signingKey: string | Buffer | jwt.Secret;

    let preprocessedKey = privateKey.trim();

    // 1) Test if it is Base64 encoded (a common Vercel workaround)
    if (!preprocessedKey.startsWith("{") && !preprocessedKey.includes("-----BEGIN")) {
      try {
        const decoded = Buffer.from(preprocessedKey, "base64").toString("utf-8");
        if (decoded.includes("-----BEGIN")) {
          preprocessedKey = decoded.trim();
        }
      } catch {
        // ignore if not valid base64
      }
    }

    // Detect if the key is in JWK format (JSON) or PEM format
    if (preprocessedKey.startsWith("{") && preprocessedKey.endsWith("}")) {
      // It's a JSON Web Key (JWK)
      const jwkObject = JSON.parse(preprocessedKey);
      
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createPrivateKey } = require("crypto");
      
      signingKey = createPrivateKey({
        key: jwkObject,
        format: "jwk",
      });
    } else {
      // It's a string PEM. Handle stringified escaped newlines \n -> literal newlines.
      let fixedPem = preprocessedKey.replace(/\\n/g, "\n");

      // SELF HEAL: Vercel UI often strips newlines into spaces when pasting,
      // even after base64 decoding if the base64 was messed up initially.
      // E.g. -----BEGIN RSA PRIVATE KEY-----
      const startMatch = fixedPem.match(/-----BEGIN [A-Z ]*KEY-----/);
      const endMatch = fixedPem.match(/-----END [A-Z ]*KEY-----/);
      
      if (startMatch && endMatch && !fixedPem.includes("\n")) {
        const startStr = startMatch[0];
        const endStr = endMatch[0];
        const startIdx = fixedPem.indexOf(startStr) + startStr.length;
        const endIdx = fixedPem.indexOf(endStr);
        
        if (startIdx > -1 && endIdx > -1 && startIdx < endIdx) {
          const body = fixedPem.substring(startIdx, endIdx).replace(/\s+/g, ""); // Strip all corrupted spaces
          // Split into 64-char lines for bulletproof crypto parsing
          const formattedBody = body.match(/.{1,64}/g)?.join("\n") || body;
          fixedPem = `${startStr}\n${formattedBody}\n${endStr}`;
        }
      }

      signingKey = fixedPem;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 7200;
    const payload = {
      sub: publicId,
      kid: keyId,
      exp: expiresAt,
      downloadable: false,
      accessRules: [
        {
          type: "any",
          action: "allow"
        }
      ]
    };

    const token = jwt.sign(
      payload,
      signingKey,
      { algorithm: "RS256", keyid: keyId }
    );

    log.info("[video-token] Token generado exitosamente", { userId: user.id, publicId, expiresAt });

    const signedUrl = `https://customer-${accountId}.cloudflarestream.com/${token}/iframe`;
    return NextResponse.json({ url: signedUrl, expiresAt });
  } catch (error: unknown) {
    const keyPrefix = privateKey ? privateKey.substring(0, 30) : "empty";
    log.error("[video-token] Error generando token", { error: String(error), keyPrefix });
    return NextResponse.json(
      { 
        error: "No se pudo generar el acceso al video.", 
        details: String(error),
        keyPrefix: keyPrefix 
      },
      { status: 500 }
    );
  }
}
