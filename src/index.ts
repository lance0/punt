import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { pasteRoutes } from "./routes/paste";
import { viewRoutes } from "./routes/view";
import { healthRoutes } from "./routes/health";
import { adminRoutes } from "./routes/admin";
import { cronRoutes } from "./routes/cron";
import { dashboardRoutes } from "./routes/dashboard";
import { cliAuthRoutes } from "./routes/cli-auth";
import { userRoutes } from "./routes/user";
import { renderHomePage } from "./templates/paste";
import { logger } from "./lib/logger";
import { auth } from "./lib/auth";

const MAX_BODY_SIZE = 4 * 1024 * 1024; // 4 MB

const app = new Elysia({
  serve: {
    maxRequestBodySize: MAX_BODY_SIZE,
  },
})
  // Request logging middleware
  .derive(({ request }) => {
    return {
      startTime: Date.now(),
      clientIp:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown",
    };
  })
  .onAfterResponse(({ request, set, startTime, clientIp }) => {
    const duration = Date.now() - startTime;
    const url = new URL(request.url);

    // Skip logging for health checks to reduce noise
    if (url.pathname === "/healthz") return;

    logger.request({
      method: request.method,
      path: url.pathname,
      status: typeof set.status === "number" ? set.status : 200,
      duration,
      ip: clientIp,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  })
  // Global error handler
  .onError(({ code, error, set, request, startTime, clientIp }) => {
    const duration = Date.now() - (startTime ?? Date.now());
    const url = new URL(request.url);

    logger.error("request_error", {
      code,
      error: error instanceof Error ? error.message : String(error),
      method: request.method,
      path: url.pathname,
      duration_ms: duration,
      ip: clientIp,
    });

    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        return "Not found";
      case "VALIDATION":
        set.status = 400;
        return "Invalid request";
      case "PARSE":
        set.status = 400;
        return "Invalid request body";
      default:
        set.status = 500;
        return "Internal server error";
    }
  })
  // Use HTML plugin
  .use(html())
  // BetterAuth handler - use all() to catch all auth routes
  .all("/api/auth/*", async ({ request }) => {
    return auth.handler(request);
  })
  // Register routes
  .use(healthRoutes)
  .use(pasteRoutes)
  .use(adminRoutes)
  .use(cronRoutes)
  .use(dashboardRoutes)
  .use(cliAuthRoutes)
  .use(userRoutes)
  // Home page
  .get("/", () => {
    return renderHomePage();
  })
  // View routes last (catch-all for /:id)
  .use(viewRoutes);

export default app;
