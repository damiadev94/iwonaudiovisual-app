import { PreApproval, PreApprovalPlan } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);
const preApprovalPlan = new PreApprovalPlan(mercadopago);

async function getOrCreatePlan(): Promise<{ id: string; init_point: string }> {
  const backUrl =
    process.env.MERCADOPAGO_BACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const existingPlanId = process.env.MERCADOPAGO_PLAN_ID;
  if (existingPlanId) {
    const plan = await preApprovalPlan.get({ preApprovalPlanId: existingPlanId });
    return { id: plan.id!, init_point: plan.init_point! };
  }

  // Primera vez: crear el plan y loguear el ID para guardarlo en .env
  const plan = await preApprovalPlan.create({
    body: {
      reason: "Iwon Audiovisual - Suscripcion Mensual",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9999,
        currency_id: "ARS",
      },
      back_url: `${backUrl}/dashboard`,
      payment_methods_allowed: {
        payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "account_money" }]
      },
    },
  });

  console.warn(
    "[mercadopago] Plan creado. Guardá este ID en MERCADOPAGO_PLAN_ID:",
    plan.id
  );

  return { id: plan.id!, init_point: plan.init_point! };
}

export async function getSubscribeUrl(): Promise<string> {
  const { init_point } = await getOrCreatePlan();
  return init_point;
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
