import { NextResponse } from "next/server";
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/mercadopago/webhook";
import type { MPWebhookEvent } from "@/types/mercadopago";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";

export async function POST(request: Request) {
  // MP sends its own x-request-id for signature; we capture it before consuming the header
  const mpRequestId = request.headers.get("x-request-id");
  const requestId = getRequestId(request);
  const log = logger.withRequestId(requestId);

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const signature = request.headers.get("x-signature");

    const isValid = verifyWebhookSignature(body, signature, mpRequestId);
    if (!isValid) {
      log.warn("Webhook: firma inválida", { signature, mpRequestId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    log.info("Webhook recibido", { type: body?.type, dataId: body?.data?.id });

    await processWebhookEvent(body as MPWebhookEvent);

    return NextResponse.json({ received: true });

  } catch (error) {
    log.error("Webhook error inesperado", { error: String(error) });

    // CLAVE: nunca devolver 500
    return NextResponse.json({ received: true });
  }
}