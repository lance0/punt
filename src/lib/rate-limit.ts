import { getDb } from "./db.ts";

const DAILY_LIMIT = 100; // pastes per IP per day

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

function getIpDateKey(ip: string): string {
  const today = new Date().toISOString().split("T")[0]; // "2025-12-09"
  return `${ip}:${today}`;
}

function getTomorrowMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const db = getDb();
  const key = getIpDateKey(ip);
  const resetAt = getTomorrowMidnight();

  const result = await db.execute({
    sql: `SELECT count FROM rate_limits WHERE ip_date = ?`,
    args: [key],
  });

  const currentCount = result.rows.length > 0 ? (result.rows[0]!.count as number) : 0;

  return {
    allowed: currentCount < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - currentCount),
    resetAt,
  };
}

export async function incrementRateLimit(ip: string): Promise<void> {
  const db = getDb();
  const key = getIpDateKey(ip);

  // Upsert: increment if exists, insert with count=1 if not
  await db.execute({
    sql: `INSERT INTO rate_limits (ip_date, count) VALUES (?, 1)
          ON CONFLICT(ip_date) DO UPDATE SET count = count + 1`,
    args: [key],
  });
}

export async function cleanupOldRateLimits(): Promise<number> {
  const db = getDb();
  const today = new Date().toISOString().split("T")[0];

  const result = await db.execute({
    sql: `DELETE FROM rate_limits WHERE ip_date NOT LIKE ?`,
    args: [`%:${today}`],
  });
  return result.rowsAffected;
}
