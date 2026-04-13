import { PreApproval } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);

export async function createSubscription(email: string, userId: string) {
  const backUrl = process.env.MERCADOPAGO_BACK_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
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
        back_url: `${backUrl}/subir-cancion`,
        external_reference: userId,
      },
    });

    return result;
  } catch (error: any) {
    console.error("--- MERCADO PAGO CREATE PREAPPROVAL ERROR ---");
    console.error("MERCADOPAGO_ACCESS_TOKEN starts with:", process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 8));
    console.error("Error instance type:", typeof error);
    console.error("Error keys:", Object.keys(error || {}));
    console.error("Error status:", error?.status);
    console.error("Error response:", JSON.stringify(error?.response || {}));
    console.error("Error message property:", error?.message);
    throw error;
  }
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
