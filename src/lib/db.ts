import { createClient, type Client } from "@libsql/client";
import { nowSeconds } from "./time";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is required");
    }

    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

// Paste types
export interface Paste {
  id: string;
  content: string;
  created_at: number;
  expires_at: number;
  views: number;
  delete_key: string;
  burn_after_read: number;
  is_private: number;
  view_key: string | null;
  language: string | null;
}

export interface CreatePasteParams {
  id: string;
  content: string;
  ttlSeconds: number;
  deleteKey: string;
  burnAfterRead?: boolean;
  isPrivate?: boolean;
  viewKey?: string;
  userId?: string;
  language?: string;
  creatorIp?: string;
}

export async function createPaste(params: CreatePasteParams): Promise<void> {
  const db = getDb();
  const now = nowSeconds();

  await db.execute({
    sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key, burn_after_read, is_private, view_key, user_id, language, creator_ip)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      params.id,
      params.content,
      now,
      now + params.ttlSeconds,
      params.deleteKey,
      params.burnAfterRead ? 1 : 0,
      params.isPrivate ? 1 : 0,
      params.viewKey ?? null,
      params.userId ?? null,
      params.language ?? null,
      params.creatorIp ?? null,
    ],
  });
}

export async function getPaste(id: string): Promise<Paste | null> {
  const db = getDb();
  const now = nowSeconds();

  const result = await db.execute({
    sql: `SELECT * FROM pastes WHERE id = ? AND expires_at > ?`,
    args: [id, now],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Paste;
}

export async function incrementViews(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `UPDATE pastes SET views = views + 1 WHERE id = ?`,
    args: [id],
  });
}

export async function deletePaste(id: string, deleteKey: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `DELETE FROM pastes WHERE id = ? AND delete_key = ?`,
    args: [id, deleteKey],
  });
  return result.rowsAffected > 0;
}

export async function deletePasteById(id: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `DELETE FROM pastes WHERE id = ?`,
    args: [id],
  });
}

// User paste management
export interface UserPaste extends Paste {
  user_id: string | null;
}

export async function getUserPastes(userId: string): Promise<UserPaste[]> {
  const db = getDb();
  const now = nowSeconds();

  const result = await db.execute({
    sql: `SELECT * FROM pastes WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC`,
    args: [userId, now],
  });

  return result.rows as unknown as UserPaste[];
}

export async function getUserPasteStats(userId: string): Promise<{
  totalPastes: number;
  activePastes: number;
  totalViews: number;
}> {
  const db = getDb();
  const now = nowSeconds();

  const [totalResult, activeResult, viewsResult] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) as count FROM pastes WHERE user_id = ?`,
      args: [userId],
    }),
    db.execute({
      sql: `SELECT COUNT(*) as count FROM pastes WHERE user_id = ? AND expires_at > ?`,
      args: [userId, now],
    }),
    db.execute({
      sql: `SELECT SUM(views) as total FROM pastes WHERE user_id = ?`,
      args: [userId],
    }),
  ]);

  return {
    totalPastes: (totalResult.rows[0]?.count as number) ?? 0,
    activePastes: (activeResult.rows[0]?.count as number) ?? 0,
    totalViews: (viewsResult.rows[0]?.total as number) ?? 0,
  };
}

export async function deleteUserPaste(id: string, userId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `DELETE FROM pastes WHERE id = ? AND user_id = ?`,
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}

export async function extendPasteTTL(
  id: string,
  userId: string,
  additionalSeconds: number
): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE pastes SET expires_at = expires_at + ? WHERE id = ? AND user_id = ?`,
    args: [additionalSeconds, id, userId],
  });
  return result.rowsAffected > 0;
}

export async function cleanupExpiredPastes(): Promise<number> {
  const db = getDb();
  const now = nowSeconds();
  const result = await db.execute({
    sql: `DELETE FROM pastes WHERE expires_at <= ?`,
    args: [now],
  });
  return result.rowsAffected;
}

// Admin stats
export interface TopUser {
  id: string;
  name: string;
  image: string | null;
  count: number;
}

export interface RecentPaste {
  id: string;
  created_at: number;
  views: number;
  user_id: string | null;
  user_name: string | null;
  creator_ip: string | null;
  language: string | null;
  burn_after_read: number;
  is_private: number;
}

export interface AdminStats {
  totalPastes: number;
  pastesToday: number;
  pastes7Days: number;
  totalViews: number;
  activePastes: number;
  burnAfterReadCount: number;
  privateCount: number;
  topIps: { ip: string; count: number }[];
  topUsers: TopUser[];
  recentPastes: RecentPaste[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDb();
  const now = nowSeconds();
  const oneDayAgo = now - 86400;
  const sevenDaysAgo = now - 86400 * 7;

  // Get paste counts
  const [totalResult, todayResult, weekResult, activeResult, viewsResult, burnResult, privateResult] =
    await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) as count FROM pastes`, args: [] }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM pastes WHERE created_at >= ?`,
        args: [oneDayAgo],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM pastes WHERE created_at >= ?`,
        args: [sevenDaysAgo],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM pastes WHERE expires_at > ?`,
        args: [now],
      }),
      db.execute({ sql: `SELECT SUM(views) as total FROM pastes`, args: [] }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM pastes WHERE burn_after_read = 1`,
        args: [],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as count FROM pastes WHERE is_private = 1`,
        args: [],
      }),
    ]);

  // Get top IPs from rate limits (exclude user: and endpoint: prefixes)
  const topIpsResult = await db.execute({
    sql: `SELECT ip_date, count FROM rate_limits
          WHERE ip_date NOT LIKE 'user:%'
          AND ip_date NOT LIKE 'cli-init:%'
          AND ip_date NOT LIKE 'report:%'
          ORDER BY count DESC LIMIT 10`,
    args: [],
  });

  const topIps = topIpsResult.rows.map((row) => {
    const ipDate = row.ip_date as string;
    // Format: IP:YYYY-MM-DD, but IP can contain colons (IPv6)
    // Split by : and remove the last segment (the date)
    const ip = ipDate.split(":").slice(0, -1).join(":");
    return { ip, count: row.count as number };
  });

  // Get top authenticated users by paste count
  const topUsersResult = await db.execute({
    sql: `SELECT p.user_id, u.name, u.image, COUNT(*) as count
          FROM pastes p
          JOIN user u ON p.user_id = u.id
          WHERE p.user_id IS NOT NULL
          GROUP BY p.user_id
          ORDER BY count DESC
          LIMIT 10`,
    args: [],
  });

  const topUsers: TopUser[] = topUsersResult.rows.map((row) => ({
    id: row.user_id as string,
    name: row.name as string,
    image: row.image as string | null,
    count: row.count as number,
  }));

  // Get recent pastes with metadata
  const recentPastesResult = await db.execute({
    sql: `SELECT p.id, p.created_at, p.views, p.user_id, p.creator_ip,
                 p.language, p.burn_after_read, p.is_private, u.name as user_name
          FROM pastes p
          LEFT JOIN user u ON p.user_id = u.id
          ORDER BY p.created_at DESC
          LIMIT 20`,
    args: [],
  });

  const recentPastes: RecentPaste[] = recentPastesResult.rows.map((row) => ({
    id: row.id as string,
    created_at: row.created_at as number,
    views: row.views as number,
    user_id: row.user_id as string | null,
    user_name: row.user_name as string | null,
    creator_ip: row.creator_ip as string | null,
    language: row.language as string | null,
    burn_after_read: row.burn_after_read as number,
    is_private: row.is_private as number,
  }));

  return {
    totalPastes: (totalResult.rows[0]?.count as number) ?? 0,
    pastesToday: (todayResult.rows[0]?.count as number) ?? 0,
    pastes7Days: (weekResult.rows[0]?.count as number) ?? 0,
    activePastes: (activeResult.rows[0]?.count as number) ?? 0,
    totalViews: (viewsResult.rows[0]?.total as number) ?? 0,
    burnAfterReadCount: (burnResult.rows[0]?.count as number) ?? 0,
    privateCount: (privateResult.rows[0]?.count as number) ?? 0,
    topIps,
    topUsers,
    recentPastes,
  };
}

// Get recent pastes filtered by IP
export async function getRecentPastesByIp(ip: string): Promise<RecentPaste[]> {
  const db = getDb();

  const result = await db.execute({
    sql: `SELECT p.id, p.created_at, p.views, p.user_id, p.creator_ip,
                 p.language, p.burn_after_read, p.is_private, u.name as user_name
          FROM pastes p
          LEFT JOIN user u ON p.user_id = u.id
          WHERE p.creator_ip = ?
          ORDER BY p.created_at DESC
          LIMIT 50`,
    args: [ip],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    created_at: row.created_at as number,
    views: row.views as number,
    user_id: row.user_id as string | null,
    user_name: row.user_name as string | null,
    creator_ip: row.creator_ip as string | null,
    language: row.language as string | null,
    burn_after_read: row.burn_after_read as number,
    is_private: row.is_private as number,
  }));
}

export async function cleanupOldRateLimits(): Promise<number> {
  const db = getDb();
  // Get today's date string
  const today = new Date().toISOString().split("T")[0];
  // Delete rate limit entries not from today
  const result = await db.execute({
    sql: `DELETE FROM rate_limits WHERE ip_date NOT LIKE ?`,
    args: [`%:${today}`],
  });
  return result.rowsAffected;
}

// Abuse reporting
export interface Report {
  id: number;
  paste_id: string;
  reason: string;
  reporter_ip: string;
  created_at: number;
  resolved: number;
}

export async function createReport(pasteId: string, reason: string, reporterIp: string): Promise<void> {
  const db = getDb();
  const now = nowSeconds();

  await db.execute({
    sql: `INSERT INTO reports (paste_id, reason, reporter_ip, created_at) VALUES (?, ?, ?, ?)`,
    args: [pasteId, reason, reporterIp, now],
  });
}

export async function getReports(unresolvedOnly = true): Promise<Report[]> {
  const db = getDb();

  const result = unresolvedOnly
    ? await db.execute({
        sql: `SELECT * FROM reports WHERE resolved = 0 ORDER BY created_at DESC`,
        args: [],
      })
    : await db.execute({
        sql: `SELECT * FROM reports ORDER BY created_at DESC LIMIT 100`,
        args: [],
      });

  return result.rows as unknown as Report[];
}

export async function resolveReport(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE reports SET resolved = 1 WHERE id = ?`,
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function getReportCountForPaste(pasteId: string): Promise<number> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM reports WHERE paste_id = ?`,
    args: [pasteId],
  });
  return (result.rows[0]?.count as number) ?? 0;
}
