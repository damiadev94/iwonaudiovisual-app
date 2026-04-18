type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, msg: string, data?: unknown) {
  const entry = JSON.stringify({
    level,
    msg,
    ...(data !== undefined ? { data } : {}),
    ts: new Date().toISOString(),
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.log(entry);
}

export const logger = {
  info: (msg: string, data?: unknown) => log("info", msg, data),
  warn: (msg: string, data?: unknown) => log("warn", msg, data),
  error: (msg: string, data?: unknown) => log("error", msg, data),
};
