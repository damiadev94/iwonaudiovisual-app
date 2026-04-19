type LogLevel = "info" | "warn" | "error";

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

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, undefined, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, undefined, data),
  error: (msg: string, data?: unknown) => log("error", msg, undefined, data),
  withRequestId: (requestId: string) => ({
    info: (msg: string, data?: unknown) => log("info", msg, requestId, data),
    warn: (msg: string, data?: unknown) => log("warn", msg, requestId, data),
    error: (msg: string, data?: unknown) => log("error", msg, requestId, data),
  }),
};
