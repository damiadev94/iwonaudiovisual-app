import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId"); // This is the CF UID

  if (!publicId) {
    return NextResponse.json({ error: "Falta el publicId." }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID;
  const privateKey = process.env.CLOUDFLARE_STREAM_PRIVATE_KEY;

  if (!accountId || !apiToken || !keyId || !privateKey) {
    return NextResponse.json({ error: "Cloudflare credentials or signing keys missing." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json(
      { error: "Suscripción no activa.", status: "inactive" },
      { status: 403 }
    );
  }

  try {
    // 1. Fetch video metadata from Cloudflare to check release_date
    const videoResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${publicId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!videoResponse.ok) {
      throw new Error("No se pudo obtener la información del video.");
    }

    const { result: videoData } = await videoResponse.json();
    const releaseDate = videoData.meta?.release_date;

    if (releaseDate) {
      const now = new Date();
      const releaseTime = new Date(releaseDate);
      if (releaseTime > now) {
        return NextResponse.json(
          { 
            error: "Contenido pendiente de estreno.", 
            releaseDate,
            message: `Este video estará disponible el ${releaseTime.toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}.` 
          },
          { status: 403 }
        );
      }
    }

    // 2. Generate Signed JWT for Cloudflare Stream
    // Expires in 2 hours
    const expiresAt = Math.floor(Date.now() / 1000) + 7200;
    
    // Formatting private key (ensuring it's treated as a proper PEM if it comes with escaped newlines)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    const token = jwt.sign(
      {
        sub: publicId,
        exp: expiresAt,
      },
      formattedPrivateKey,
      {
        algorithm: "RS256",
        header: {
          alg: "RS256",
          kid: keyId,
        },
      }
    );

    const signedUrl = `https://customer-${accountId}.cloudflarestream.com/${token}/iframe`;

    return NextResponse.json({ url: signedUrl, expiresAt });
  } catch (error: any) {
    console.error("[GET /api/cursos/video-token]", error);
    return NextResponse.json({ error: "No se pudo generar el acceso al video." }, { status: 500 });
  }
}
