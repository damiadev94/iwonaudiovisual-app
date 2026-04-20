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
  const { title } = body;
  const videoName = (title as string | undefined)?.trim() || "Sin título";

  try {
    // direct_upload returns a CORS-enabled URL at upload.videodelivery.net
    // that supports TUS PATCH/HEAD directly from the browser
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          meta: { name: videoName, title: videoName },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare direct_upload error:", response.status, errorText);
      return NextResponse.json(
        { error: `Cloudflare error ${response.status}: ${errorText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      uploadUrl: data.result.uploadURL,
      uid: data.result.uid,
    });
  } catch (error: unknown) {
    console.error("[POST /api/admin/video/upload-url]", error);
    return NextResponse.json({ error: "No se pudo generar el URL de subida." }, { status: 500 });
  }
}
