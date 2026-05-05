import { PreApproval, PreApprovalPlan } from "mercadopago";
import { mercadopago } from "./client";

const preApproval = new PreApproval(mercadopago);
const preApprovalPlan = new PreApprovalPlan(mercadopago);


async function getPlanId(): Promise<string> {
  const existingPlanId = process.env.MERCADOPAGO_PLAN_ID?.trim();

  if (existingPlanId) return existingPlanId;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta MERCADOPAGO_PLAN_ID en entorno de producción");
  }

  const backUrl =
    process.env.MERCADOPAGO_BACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

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

function getBackUrl(): string {
  return (
    process.env.MERCADOPAGO_BACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export type CreatedSubscription = {
  preapproval_id: string;
  init_point: string;
};

/**
 * Crea una PreApproval en MercadoPago vinculada al plan, con external_reference
 * persistido en el body (no en la URL). Esto es lo que permite al webhook ubicar
 * al usuario incluso cuando MP no devuelve el preapproval_id en el back_url.
 */
export async function createSubscriptionForUser(
  userId: string,
  email: string
): Promise<CreatedSubscription> {
  const planId = await getPlanId();
  const backUrl = getBackUrl();

  const result = await preApproval.create({
    body: {
      preapproval_plan_id: planId,
      payer_email: email,
      external_reference: userId,
      back_url: `${backUrl}/suscripcion/exito`,
      status: "pending",
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error(
      `MP devolvió una preapproval inválida (id=${result.id}, init_point=${result.init_point})`
    );
  }

  return {
    preapproval_id: result.id,
    init_point: result.init_point,
  };
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
