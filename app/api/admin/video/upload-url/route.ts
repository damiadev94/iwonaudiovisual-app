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
  const { title, fileSize } = body;

  if (!fileSize || typeof fileSize !== "number") {
    return NextResponse.json({ error: "fileSize requerido." }, { status: 400 });
  }

  const videoName = (title as string | undefined)?.trim() || "Sin título";

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Tus-Resumable": "1.0.0",
          "Upload-Length": String(fileSize),
          "Upload-Metadata": `name ${Buffer.from(videoName).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare TUS error:", response.status, errorText);
      return NextResponse.json(
        { error: `Cloudflare error ${response.status}: ${errorText}` },
        { status: 502 }
      );
    }

    const uploadUrl = response.headers.get("Location");
    const uid = response.headers.get("stream-media-id");

    if (!uploadUrl || !uid) {
      throw new Error("Cloudflare no devolvió Location o stream-media-id");
    }

    return NextResponse.json({ uploadUrl, uid });
  } catch (error: unknown) {
    console.error("[POST /api/admin/video/upload-url]", error);
    return NextResponse.json({ error: "No se pudo generar el URL de subida." }, { status: 500 });
  }
}
