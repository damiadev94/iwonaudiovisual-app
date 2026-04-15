import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Cloudflare credentials missing." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, courseSlug } = body;

  try {
    // Request a Direct Creator Upload URL from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
          meta: {
            name: `cursos/${courseSlug || "general"}/${title || "video"}`,
            title: title || "Video lección",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare API Error:", errorText);
      throw new Error(`Cloudflare API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // data.result.uploadURL: The URL to perform the POST to
    // data.result.uid: The UID that will be assigned to the video
    return NextResponse.json({
      uploadUrl: data.result.uploadURL,
      uid: data.result.uid,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/video/upload-url]", error);
    return NextResponse.json({ error: "No se pudo generar el URL de subida." }, { status: 500 });
  }
}
