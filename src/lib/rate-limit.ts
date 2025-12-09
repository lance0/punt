import { getDb } from "./db";

const DAILY_LIMIT_ANONYMOUS = 100; // pastes per IP per day
const DAILY_LIMIT_AUTHENTICATED = 1000; // pastes per user per day

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
    allowed: currentCount < DAILY_LIMIT_ANONYMOUS,
    remaining: Math.max(0, DAILY_LIMIT_ANONYMOUS - currentCount),
    resetAt,
  };
}

// User-based rate limiting for authenticated users
function getUserDateKey(userId: string): string {
  const today = new Date().toISOString().split("T")[0]; // "2025-12-09"
  return `user:${userId}:${today}`;
}

export async function checkUserRateLimit(userId: string): Promise<RateLimitResult> {
  const db = getDb();
  const key = getUserDateKey(userId);
  const resetAt = getTomorrowMidnight();

  const result = await db.execute({
    sql: `SELECT count FROM rate_limits WHERE ip_date = ?`,
    args: [key],
  });

  const currentCount = result.rows.length > 0 ? (result.rows[0]!.count as number) : 0;

  return {
    allowed: currentCount < DAILY_LIMIT_AUTHENTICATED,
    remaining: Math.max(0, DAILY_LIMIT_AUTHENTICATED - currentCount),
    resetAt,
  };
}

export async function incrementUserRateLimit(userId: string): Promise<void> {
  const db = getDb();
  const key = getUserDateKey(userId);

  // Upsert: increment if exists, insert with count=1 if not
  await db.execute({
    sql: `INSERT INTO rate_limits (ip_date, count) VALUES (?, 1)
          ON CONFLICT(ip_date) DO UPDATE SET count = count + 1`,
    args: [key],
  });
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
