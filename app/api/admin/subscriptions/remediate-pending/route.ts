import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { PreApproval } from "mercadopago";
import { mercadopago } from "@/lib/mercadopago/client";

const STATUS_MAP: Record<string, string> = {
  authorized: "active",
  paused: "paused",
  cancelled: "cancelled",
  pending: "pending",
};

type RemediationResult = {
  subscription_id: string;
  user_id: string;
  email?: string;
  action: "activated" | "linked" | "cancelled" | "no_match" | "skipped" | "error";
  mp_status?: string;
  mp_preapproval_id?: string;
  detail?: string;
};

/**
 * POST /api/admin/subscriptions/remediate-pending
 *
 * Recorre todas las suscripciones en estado 'pending' que NO tienen mp_preapproval_id
 * y trata de matchearlas contra MercadoPago usando el email del usuario.
 *
 * Estos son rows que quedaron huérfanos por el bug del flujo viejo: pre-creábamos
 * un row pending sin guardar el preapproval_id en DB y MP no devolvía external_reference
 * en sus respuestas, así que ningún sistema (webhook, link, cron) podía recuperarlos.
 *
 * Body opcional: { dry_run?: boolean } — si true, no toca la DB, solo reporta.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => ({}));
  const dryRun = Boolean(body?.dry_run);
  const forceActivate = Boolean(body?.force_activate);

  const adminClient = createAdminClient();
  const preApproval = new PreApproval(mercadopago);

  // 1) Pendings sin mp_preapproval_id (los huérfanos)
  const { data: pendings, error: fetchError } = await adminClient
    .from("subscriptions")
    .select("id, user_id, status, mp_preapproval_id")
    .eq("status", "pending")
    .is("mp_preapproval_id", null);

  if (fetchError) {
    return NextResponse.json(
      { error: "DB error", detail: fetchError.message },
      { status: 500 }
    );
  }

  const results: RemediationResult[] = [];

  for (const sub of pendings ?? []) {
    // 2) Resolver el email del usuario via auth admin API
    let email: string | undefined;
    try {
      const { data: userData } = await adminClient.auth.admin.getUserById(sub.user_id);
      email = userData?.user?.email ?? undefined;
    } catch (err) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        action: "error",
        detail: `getUserById failed: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    if (!email) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        action: "skipped",
        detail: "user has no email",
      });
      continue;
    }

    // 3a) Modo force_activate: activar directo sin buscar en MP
    if (forceActivate) {
      if (!dryRun) {
        const { error: updateError } = await adminClient
          .from("subscriptions")
          .update({ status: "active" })
          .eq("id", sub.id);

        if (updateError) {
          results.push({ subscription_id: sub.id, user_id: sub.user_id, email, action: "error", detail: `DB update failed: ${updateError.message}` });
          continue;
        }
      }
      results.push({ subscription_id: sub.id, user_id: sub.user_id, email, action: "activated", detail: dryRun ? "dry_run" : "force_activated" });
      continue;
    }

    // 3b) Buscar en MP por external_reference (poco fiable en plan checkout) y por payer_email
    type MPItem = {
      id?: string;
      status?: string;
      external_reference?: string | number;
      date_created?: string | number;
    };

    const serializeMPError = (err: unknown): string => {
      if (err instanceof Error) return err.message;
      try { return JSON.stringify(err); } catch { return String(err); }
    };

    let candidates: MPItem[] = [];
    let extRefError: string | null = null;
    try {
      const byExtRef = await preApproval.search({
        options: {
          external_reference: sub.user_id,
          sort: "date_created",
          criteria: "desc",
          limit: 5,
        },
      });
      candidates = ((byExtRef as { results?: MPItem[] }).results ?? []).slice();
    } catch (err) {
      extRefError = serializeMPError(err);
    }

    if (candidates.length === 0) {
      try {
        const byEmail = await preApproval.search({
          options: {
            payer_email: email,
            sort: "date_created",
            criteria: "desc",
            limit: 5,
          },
        });
        candidates = ((byEmail as { results?: MPItem[] }).results ?? []).slice();
      } catch (err) {
        results.push({
          subscription_id: sub.id,
          user_id: sub.user_id,
          email,
          action: "error",
          detail: `MP search failed — extRef: ${extRefError ?? "ok"} | email: ${serializeMPError(err)}`,
        });
        continue;
      }
    }

    if (candidates.length === 0) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        email,
        action: "no_match",
      });
      continue;
    }

    // 4) Elegir la mejor candidata: priorizar authorized, luego la más reciente
    const authorized = candidates.find((c) => c.status === "authorized");
    const chosen = authorized ?? candidates[0];
    const mpStatus = chosen.status ?? "unknown";
    const newStatus = STATUS_MAP[mpStatus] ?? "pending";

    if (!chosen.id) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        email,
        action: "skipped",
        mp_status: mpStatus,
        detail: "MP item missing id",
      });
      continue;
    }

    // 5) Actualizar la DB (salvo dry_run)
    if (dryRun) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        email,
        action: newStatus === "active" ? "activated" : "linked",
        mp_status: mpStatus,
        mp_preapproval_id: chosen.id,
        detail: "dry_run — no DB changes applied",
      });
      continue;
    }

    const { error: updateError } = await adminClient
      .from("subscriptions")
      .update({
        status: newStatus,
        mp_preapproval_id: chosen.id,
        mp_subscription_id: chosen.id,
      })
      .eq("id", sub.id);

    if (updateError) {
      results.push({
        subscription_id: sub.id,
        user_id: sub.user_id,
        email,
        action: "error",
        detail: `DB update failed: ${updateError.message}`,
      });
      continue;
    }

    results.push({
      subscription_id: sub.id,
      user_id: sub.user_id,
      email,
      action:
        newStatus === "active"
          ? "activated"
          : newStatus === "cancelled"
            ? "cancelled"
            : "linked",
      mp_status: mpStatus,
      mp_preapproval_id: chosen.id,
    });
  }

  const summary = {
    total: results.length,
    activated: results.filter((r) => r.action === "activated").length,
    linked: results.filter((r) => r.action === "linked").length,
    cancelled: results.filter((r) => r.action === "cancelled").length,
    no_match: results.filter((r) => r.action === "no_match").length,
    skipped: results.filter((r) => r.action === "skipped").length,
    error: results.filter((r) => r.action === "error").length,
  };

  console.log(
    `[admin/remediate-pending] admin=${guard.userId} dry_run=${dryRun} summary=${JSON.stringify(summary)}`
  );

  return NextResponse.json({ dry_run: dryRun, summary, results });
}
