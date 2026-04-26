import { redis } from "@/lib/redis/client";
import { Resend } from "resend";

export type AlertType = "401" | "403" | "5xx";

const THRESHOLDS: Record<AlertType, number> = {
  "401": 10,
  "403": 10,
  "5xx": 5,
};

const WINDOW_SECONDS = 5 * 60; // 5-minute sliding window
const COOLDOWN_SECONDS = 15 * 60; // 15-minute cooldown between alerts

function windowKey(type: AlertType): string {
  const window = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
  return `alerts:count:${type}:${window}`;
}

function cooldownKey(type: AlertType): string {
  return `alerts:cooldown:${type}`;
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendAlertEmail(type: AlertType, count: number, path?: string): Promise<void> {
  const alertEmail = process.env.ALERT_EMAIL;
  if (!alertEmail) return;

  const labels: Record<AlertType, string> = {
    "401": "Incremento de errores 401 (No Autorizado)",
    "403": "Incremento de errores 403 (Prohibido)",
    "5xx": "Incremento de errores de API (5xx)",
  };

  const pathInfo = path ? `<p><strong>Última ruta:</strong> ${path}</p>` : "";

  await getResend().emails.send({
    from: "Iwon Audiovisual Alerts <noreply@iwonaudiovisual.com>",
    to: alertEmail,
    subject: `[ALERTA] ${labels[type]} — ${count} eventos en 5 min`,
    html: `
      <div style="background:#0A0A0A;color:#F5F5F5;padding:40px;font-family:sans-serif;">
        <h1 style="color:#E53E3E;">⚠ Alerta de Sistema</h1>
        <p><strong>${labels[type]}</strong></p>
        <p>Se detectaron <strong>${count}</strong> eventos del tipo <code style="background:#1A1A1A;padding:2px 6px;border-radius:4px;">${type}</code> en los últimos 5 minutos.</p>
        ${pathInfo}
        <p style="color:#999;margin-top:24px;font-size:14px;">Iwon Audiovisual — Sistema de Alertas</p>
      </div>
    `,
  });
}

export async function recordAndCheckAlert(type: AlertType, path?: string): Promise<void> {
  try {
    const onCooldown = await redis.exists(cooldownKey(type));
    if (onCooldown) return;

    const key = windowKey(type);
    const count = await redis.incr(key);

    if (count === 1) {
      // Set TTL only on first increment to let the key expire naturally
      await redis.expire(key, WINDOW_SECONDS * 2);
    }

    if (count >= THRESHOLDS[type]) {
      // Set cooldown before sending so concurrent requests don't double-alert
      await redis.set(cooldownKey(type), "1", { ex: COOLDOWN_SECONDS });
      await sendAlertEmail(type, count, path);
    }
  } catch {
    // Alerts must never break the request path
  }
}

export async function sendTestAlert(type: AlertType): Promise<{ sent: boolean; reason?: string }> {
  const alertEmail = process.env.ALERT_EMAIL;
  if (!alertEmail) {
    return { sent: false, reason: "ALERT_EMAIL env var not set" };
  }

  try {
    await sendAlertEmail(type, THRESHOLDS[type], "/api/test");
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: String(err) };
  }
}

export async function getAlertCounters(): Promise<Record<AlertType, { count: number; onCooldown: boolean }>> {
  const types: AlertType[] = ["401", "403", "5xx"];

  const results = await Promise.all(
    types.map(async (type) => {
      const count = (await redis.get<number>(windowKey(type))) ?? 0;
      const onCooldown = (await redis.exists(cooldownKey(type))) === 1;
      return { type, count, onCooldown };
    })
  );

  return Object.fromEntries(
    results.map(({ type, count, onCooldown }) => [type, { count, onCooldown }])
  ) as Record<AlertType, { count: number; onCooldown: boolean }>;
}
