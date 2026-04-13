import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/config";
import { requireAdmin } from "@/lib/admin-guard";

const ALLOWED_FOLDER = "iwon/lecciones";
const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 min window

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body?.paramsToSign || typeof body.paramsToSign !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { paramsToSign } = body as { paramsToSign: Record<string, unknown> };

  // Reject stale/future timestamps (prevents replay attacks)
  const ts = Number(paramsToSign.timestamp);
  if (!ts || Math.abs(Date.now() / 1000 - ts) > TIMESTAMP_TOLERANCE_SECONDS) {
    return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
  }

  // Reject uploads targeting a folder outside the allowed one.
  // The widget sends folder as part of paramsToSign when options.folder is set.
  const requestedFolder = paramsToSign.folder;
  if (requestedFolder !== undefined && requestedFolder !== ALLOWED_FOLDER) {
    return NextResponse.json({ error: "Folder not allowed" }, { status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ signature });
}
