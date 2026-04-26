import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sendTestAlert, getAlertCounters, type AlertType } from "@/lib/alerts";

const VALID_TYPES: AlertType[] = ["401", "403", "5xx"];

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const counters = await getAlertCounters();
  return NextResponse.json({ counters });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => ({}));
  const type: AlertType = body.type ?? "5xx";

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await sendTestAlert(type);
  return NextResponse.json(result);
}
