import { PreApproval } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);

export async function createSubscription(email: string, userId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await preApproval.create({
    body: {
      reason: "Iwon Audiovisual - Suscripcion Mensual",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9999,
        currency_id: "ARS",
      },
      payer_email: email,
      back_url: `${appUrl}/dashboard`,
      external_reference: userId,
    },
  });

  return result;
}

export async function cancelSubscription(preapprovalId: string) {
  const result = await preApproval.update({
    id: preapprovalId,
    body: {
      status: "cancelled",
    },
  });

  return result;
}

export async function getSubscriptionStatus(preapprovalId: string) {
  const result = await preApproval.get({ id: preapprovalId });
  return result;
}
