import { Elysia, t } from "elysia";
import { getAdminStats, cleanupExpiredPastes, cleanupOldRateLimits, getReports, resolveReport, deletePasteById } from "../lib/db";

// Simple bearer token auth for admin endpoints
function verifyAdminToken(authorization: string | null): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;
  if (!authorization) return false;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return false;

  return token === adminToken;
}

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  // Admin stats endpoint
  .get("/stats", async ({ request, set }) => {
    const auth = request.headers.get("authorization");

    if (!verifyAdminToken(auth)) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const stats = await getAdminStats();
    return stats;
  })

  // Manual cleanup endpoint
  .post("/cleanup", async ({ request, set }) => {
    const auth = request.headers.get("authorization");

    if (!verifyAdminToken(auth)) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const [expiredPastes, oldRateLimits] = await Promise.all([
      cleanupExpiredPastes(),
      cleanupOldRateLimits(),
    ]);

    return {
      cleaned: {
        expiredPastes,
        oldRateLimits,
      },
      timestamp: new Date().toISOString(),
    };
  })

  // Get abuse reports
  .get("/reports", async ({ request, query, set }) => {
    const auth = request.headers.get("authorization");

    if (!verifyAdminToken(auth)) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const showAll = query.all === "true";
    const reports = await getReports(!showAll);

    return { reports };
  })

  // Resolve a report
  .post(
    "/reports/:id/resolve",
    async ({ request, params, set }) => {
      const auth = request.headers.get("authorization");

      if (!verifyAdminToken(auth)) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const id = parseInt(params.id, 10);
      if (isNaN(id)) {
        set.status = 400;
        return { error: "Invalid report ID" };
      }

      const resolved = await resolveReport(id);
      if (!resolved) {
        set.status = 404;
        return { error: "Report not found" };
      }

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Delete a reported paste and resolve all its reports
  .delete(
    "/paste/:id",
    async ({ request, params, set }) => {
      const auth = request.headers.get("authorization");

      if (!verifyAdminToken(auth)) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      await deletePasteById(params.id);

      return { success: true, message: "Paste deleted" };
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
    }
  );
