// Structured JSON logging for observability

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  [key: string]: unknown;
}

function formatLog(level: LogEntry["level"], message: string, data?: Record<string, unknown>): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    console.log(formatLog("info", message, data));
  },

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(formatLog("warn", message, data));
  },

  error(message: string, data?: Record<string, unknown>) {
    console.error(formatLog("error", message, data));
  },

  // Request logging helper
  request(data: {
    method: string;
    path: string;
    status: number;
    duration: number;
    ip?: string;
    userAgent?: string;
  }) {
    const level = data.status >= 500 ? "error" : data.status >= 400 ? "warn" : "info";
    console[level](
      formatLog(level, "request", {
        method: data.method,
        path: data.path,
        status: data.status,
        duration_ms: data.duration,
        ip: data.ip,
        user_agent: data.userAgent,
      })
    );
  },
};
