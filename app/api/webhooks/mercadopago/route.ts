import { NextResponse } from "next/server";
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/mercadopago/webhook";
import type { MPWebhookEvent } from "@/types/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");

    // Verify signature
    const isValid = verifyWebhookSignature(body, signature, requestId);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: MPWebhookEvent = JSON.parse(body);

    // Process the event
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
