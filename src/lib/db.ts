import { createClient, type Client } from "@libsql/client";
import { nowSeconds } from "./time.ts";

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
}

export interface CreatePasteParams {
  id: string;
  content: string;
  ttlSeconds: number;
  deleteKey: string;
  burnAfterRead?: boolean;
  isPrivate?: boolean;
  viewKey?: string;
}

export async function createPaste(params: CreatePasteParams): Promise<void> {
  const db = getDb();
  const now = nowSeconds();

  await db.execute({
    sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key, burn_after_read, is_private, view_key)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      params.id,
      params.content,
      now,
      now + params.ttlSeconds,
      params.deleteKey,
      params.burnAfterRead ? 1 : 0,
      params.isPrivate ? 1 : 0,
      params.viewKey ?? null,
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

export async function cleanupExpiredPastes(): Promise<number> {
  const db = getDb();
  const now = nowSeconds();
  const result = await db.execute({
    sql: `DELETE FROM pastes WHERE expires_at <= ?`,
    args: [now],
  });
  return result.rowsAffected;
}
