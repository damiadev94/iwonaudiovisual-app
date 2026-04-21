import { PreApproval, PreApprovalPlan } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);
const preApprovalPlan = new PreApprovalPlan(mercadopago);


async function getPlanId(): Promise<string> {
  const existingPlanId = process.env.MERCADOPAGO_PLAN_ID;

  if (!process.env.MERCADOPAGO_PLAN_ID) {
    throw new Error("Falta MERCADOPAGO_PLAN_ID en entorno");
  }

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

export async function getSubscribeUrl(userId: string, _email: string): Promise<string> {
  const planId = await getPlanId();

  // Usamos la URL directa del checkout de planes de Mercado Pago.
  // Esto evita errores de 'card_token_id is required' y es el flujo oficial de Checkout Pro.
  // El usuario será vinculado al finalizar en el back_url mediante el preapproval_id.
  const domain = "www.mercadopago.com.ar"; // Ajustado para ARS (Argentina)
  return `https://${domain}/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${userId}`;
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

/**
 * Busca la suscripción más reciente de un usuario usando su external_reference (userId).
 * Útil cuando MP no devuelve el preapproval_id en la URL de retorno (flujo de plan).
 */
export async function findSubscriptionByExternalRef(
  userId: string
): Promise<{ id: string; status: string; auto_recurring?: { transaction_amount?: number }; date_created?: string } | null> {
  try {
    // La API de MP permite filtrar preapprovals por external_reference
    const result = await preApproval.search({
      options: {
        external_reference: userId,
        sort: "date_created",
        criteria: "desc",
        limit: 1,
      },
    });

    const items = (result as { results?: Array<{ id: string; status: string; auto_recurring?: { transaction_amount?: number }; date_created?: string }> }).results;
    if (items && items.length > 0) {
      return items[0];
    }
    return null;
  } catch {
    return null;
  }
}
