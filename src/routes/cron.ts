import { Elysia } from "elysia";
import { cleanupExpiredPastes, cleanupOldRateLimits } from "../lib/db";
import { logger } from "../lib/logger";

// Verify the request is from Vercel Cron
function verifyCronSecret(authorization: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // If no secret configured, allow in development
  if (!cronSecret) return process.env.NODE_ENV !== "production";

  if (!authorization) return false;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return false;

  return token === cronSecret;
}

export const cronRoutes = new Elysia({ prefix: "/api/cron" })
  // Cleanup endpoint - called by Vercel cron
  .get("/cleanup", async ({ request, set }) => {
    const auth = request.headers.get("authorization");

    if (!verifyCronSecret(auth)) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const startTime = Date.now();

    const [expiredPastes, oldRateLimits] = await Promise.all([
      cleanupExpiredPastes(),
      cleanupOldRateLimits(),
    ]);

    const duration = Date.now() - startTime;

    logger.info("cron_cleanup", {
      expired_pastes_deleted: expiredPastes,
      old_rate_limits_deleted: oldRateLimits,
      duration_ms: duration,
    });

    return {
      success: true,
      cleaned: {
        expiredPastes,
        oldRateLimits,
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    };
  });
