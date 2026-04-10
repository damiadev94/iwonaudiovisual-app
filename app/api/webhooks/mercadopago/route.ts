import { NextResponse } from "next/server";
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/mercadopago/webhook";
import type { MPWebhookEvent } from "@/types/mercadopago";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const signature = request.headers.get("x-signature");
    const requestId = request.headers.get("x-request-id");

    // ⚠️ OPCIONAL (recomendado desactivar mientras debuggeás)
    // const isValid = verifyWebhookSignature(body, signature, requestId);
    // if (!isValid) {
    //   console.error("Invalid signature");
    //   return NextResponse.json({ received: true }); // 👈 SIEMPRE 200
    // }

    console.log("Webhook recibido:", body);

    await processWebhookEvent(body as MPWebhookEvent);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);

    // 🔥 CLAVE: nunca devolver 500
    return NextResponse.json({ received: true });
  }
}