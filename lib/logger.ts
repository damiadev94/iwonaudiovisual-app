import { recordAndCheckAlert, type AlertType } from "@/lib/alerts";

type LogLevel = "info" | "warn" | "error";

interface MetricData {
  event: "http.request";
  path: string;
  status: number;
  durationMs: number;
  [key: string]: unknown;
}

function log(level: LogLevel, msg: string, requestId: string | undefined, data?: unknown) {
  const entry = JSON.stringify({
    level,
    msg,
    ...(requestId ? { requestId } : {}),
    ...(data !== undefined ? { data } : {}),
    ts: new Date().toISOString(),
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.log(entry);
}

function alertType(status: number): AlertType | null {
  if (status === 401) return "401";
  if (status === 403) return "403";
  if (status >= 500) return "5xx";
  return null;
}

function logMetric(requestId: string | undefined, data: MetricData) {
  console.log(
    JSON.stringify({
      level: "info",
      ...(requestId ? { requestId } : {}),
      ts: new Date().toISOString(),
      ...data,
    })
  );

  const type = alertType(data.status);
  if (type) {
    // Fire-and-forget: never block the response
    recordAndCheckAlert(type, data.path).catch(() => undefined);
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, undefined, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, undefined, data),
  error: (msg: string, data?: unknown) => log("error", msg, undefined, data),
  withRequestId: (requestId: string) => ({
    info: (msg: string, data?: unknown) => log("info", msg, requestId, data),
    warn: (msg: string, data?: unknown) => log("warn", msg, requestId, data),
    error: (msg: string, data?: unknown) => log("error", msg, requestId, data),
    metric: (data: Omit<MetricData, "event">) =>
      logMetric(requestId, { event: "http.request", ...data } as MetricData),
  }),
};
