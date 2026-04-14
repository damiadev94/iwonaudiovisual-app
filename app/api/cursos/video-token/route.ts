import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cloudinary } from "@/lib/cloudinary/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId");

  if (!publicId) {
    return NextResponse.json({ error: "Falta el publicId." }, { status: 400 });
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
    // Validate if the content is already released
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "video",
      context: true,
    });

    const releaseDate = resource.context?.custom?.release_date;
    if (releaseDate) {
      const now = new Date();
      const releaseTime = new Date(releaseDate);
      if (releaseTime > now) {
        return NextResponse.json(
          { 
            error: "Este contenido aún no está disponible.", 
            releaseDate,
            message: "Regresa pronto para ver este estreno." 
          },
          { status: 403 }
        );
      }
    }

    // Generate a signed playback URL (or token)
    // Cloudinary video_url with sign_url: true and expires_at
    // TTL of 2 hours (7200 seconds)
    const expiresAt = Math.floor(Date.now() / 1000) + 7200;
    
    // Cloudinary signed URL generation
    // We can also use private_download_url for direct file access
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "video",
      sign_url: true,
      secure: true,
      expires_at: expiresAt,
    });

    return NextResponse.json({ url: signedUrl, expiresAt });
  } catch (error: any) {
    console.error("[GET /api/cursos/video-token]", error);
    return NextResponse.json({ error: "No se pudo generar el acceso al video." }, { status: 500 });
  }
}
