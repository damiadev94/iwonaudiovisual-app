import { PreApproval, PreApprovalPlan } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);
const preApprovalPlan = new PreApprovalPlan(mercadopago);

async function getPlanId(): Promise<string> {
  const existingPlanId = process.env.MERCADOPAGO_PLAN_ID;
  if (existingPlanId) return existingPlanId;

  const backUrl =
    process.env.MERCADOPAGO_BACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  // Primera vez: crear el plan y loguear el ID para guardarlo en .env
  const plan = await preApprovalPlan.create({
    body: {
      reason: "Iwon Audiovisual - Suscripción Mensual",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 14999, 
        currency_id: "ARS",
      },
      back_url: `${backUrl}/suscripcion/exito`,
    },
  });



  console.warn(
    "[mercadopago] Plan creado. Guardá este ID en MERCADOPAGO_PLAN_ID:",
    plan.id
  );

  return plan.id!;
}

export async function getSubscribeUrl(userId: string, email: string): Promise<string> {
  const planId = await getPlanId();

  // Usamos la URL directa del checkout de planes de Mercado Pago.
  // Esto evita errores de 'card_token_id is required' y es el flujo oficial de Checkout Pro.
  // El usuario será vinculado al finalizar en el back_url mediante el preapproval_id.
  const domain = "www.mercadopago.com.ar"; // Ajustado para ARS (Argentina)
  return `https://${domain}/subscriptions/checkout?preapproval_plan_id=${planId}`;
}




export async function cancelSubscription(preapprovalId: string) {
  const result = await preApproval.update({
    id: preapprovalId,
    body: { status: "cancelled" },
  });
  return result;
}

export async function getSubscriptionStatus(preapprovalId: string) {
  const result = await preApproval.get({ id: preapprovalId });
  return result;
}
