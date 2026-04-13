import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MPWebhookEvent } from "@/types/mercadopago";
import { PreApproval, Payment } from "mercadopago";
import { mercadopago } from "./client";

export function verifyWebhookSignature(
  body: any,
  signature: string | null,
  requestId: string | null,
): boolean {
  if (!signature || !requestId) return false;

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts = signature.split(",");
  const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !v1) return false;

  const manifest = `id:${body.data.id};request-id:${requestId};ts:${ts};`;

  const hmac = createHmac("sha256", secret).update(manifest).digest("hex");

  return hmac === v1;
}

export async function processWebhookEvent(event: MPWebhookEvent) {
  const supabase = createAdminClient();

  if (event.type === "subscription_preapproval") {
    try {
      const preApproval = new PreApproval(mercadopago);
      const preapprovalData = await preApproval.get({ id: event.data.id });

      const statusMap: Record<string, string> = {
        authorized: "active",
        paused: "paused",
        cancelled: "cancelled",
        pending: "pending",
      };

      const status = statusMap[preapprovalData.status || ""] || "pending";
      const payerEmail = (preapprovalData as any).payer_email as string | undefined;
      const externalRef = (preapprovalData as any).external_reference as string | undefined;

      // Intentar crear/actualizar la suscripción buscando por external_reference (User ID)
      if (externalRef) {
        await supabase.from("subscriptions").upsert(
          {
            user_id: externalRef,
            mp_subscription_id: preapprovalData.id,
            mp_preapproval_id: preapprovalData.id,
            status,
            plan_amount: (preapprovalData as any).auto_recurring?.transaction_amount ?? 9999,
            currency: "ARS",
            current_period_start:
              preapprovalData.last_modified ?? preapprovalData.date_created,
          },
          { onConflict: "user_id" }
        );
        return;
      }

      // Fallback: actualizar por mp_subscription_id si ya existe el registro
      await supabase
        .from("subscriptions")
        .update({
          status,
          current_period_start:
            preapprovalData.last_modified ?? preapprovalData.date_created,
        })
        .eq("mp_subscription_id", preapprovalData.id);
    } catch (error) {
      console.error("Error fetching preapproval data:", error);
    }
  } else if (event.type === "payment") {

    try {
      const payment = new Payment(mercadopago);

      const paymentData = await payment.get({
        id: event.data.id,
      });

      const statusMap: Record<string, string> = {
        approved: "approved",
        pending: "pending",
        rejected: "rejected",
        refunded: "refunded",
      };

      const paymentStatus = statusMap[paymentData.status || ""] || "pending";

      const externalRef = paymentData.external_reference;

      if (externalRef) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", externalRef)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (subscription) {
          await supabase.from("payments").insert({
            user_id: externalRef,
            subscription_id: subscription.id,
            mp_payment_id: String(paymentData.id),
            amount: paymentData.transaction_amount || 0,
            currency: paymentData.currency_id || "ARS",
            status: paymentStatus,
            payment_method: paymentData.payment_method_id || null,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  }
}
