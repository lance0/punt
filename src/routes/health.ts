import { Elysia } from "elysia";
import { getDb } from "../lib/db";

export const healthRoutes = new Elysia().get("/healthz", async ({ set }) => {
  try {
    const db = getDb();
    await db.execute("SELECT 1");

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    };
  } catch (error) {
    set.status = 503;
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
