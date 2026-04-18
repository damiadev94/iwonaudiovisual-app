import { NextResponse } from "next/server";
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/mercadopago/webhook";
import type { MPWebhookEvent } from "@/types/mercadopago";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");

    const isValid = verifyWebhookSignature(body, signature, requestId);
    if (!isValid) {
      logger.warn("Webhook: firma inválida", { signature, requestId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    logger.info("Webhook recibido", { type: body?.type, dataId: body?.data?.id });

    await processWebhookEvent(body as MPWebhookEvent);

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error("Webhook error inesperado", { error: String(error) });

    // 🔥 CLAVE: nunca devolver 500
    return NextResponse.json({ received: true });
  }
}