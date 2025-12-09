import { nanoid } from "nanoid";
import { getDb } from "./db";
import { nowSeconds } from "./time";

// Token format: punt_<32-char-nanoid>
const TOKEN_PREFIX = "punt_";

export interface ApiToken {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
  last_used_at: number | null;
  expires_at: number | null;
  revoked: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Generate a new API token
export function generateApiToken(): { token: string; hash: string } {
  const token = TOKEN_PREFIX + nanoid(32);
  const hash = hashToken(token);
  return { token, hash };
}

// Hash a token using SHA-256
export function hashToken(token: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = Bun.hash(data);
  // Convert to hex string
  return hashBuffer.toString(16).padStart(16, "0");
}

// Validate an API token and return the user if valid
export async function validateApiToken(token: string): Promise<User | null> {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const db = getDb();
  const hash = hashToken(token);
  const now = nowSeconds();

  const result = await db.execute({
    sql: `SELECT t.id, t.user_id, t.expires_at, t.revoked,
                 u.id as uid, u.name, u.email, u.image
          FROM api_tokens t
          JOIN user u ON t.user_id = u.id
          WHERE t.token_hash = ?`,
    args: [hash],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0]!;

  // Check if revoked
  if (row.revoked === 1) {
    return null;
  }

  // Check if expired
  const expiresAt = row.expires_at as number | null;
  if (expiresAt && expiresAt < now) {
    return null;
  }

  // Update last_used_at
  const tokenId = row.id as string;
  await db.execute({
    sql: `UPDATE api_tokens SET last_used_at = ? WHERE id = ?`,
    args: [now, tokenId],
  });

  return {
    id: row.uid as string,
    name: row.name as string,
    email: row.email as string,
    image: row.image as string | null,
  };
}

// Create a new API token for a user
export async function createApiToken(
  userId: string,
  name = "CLI Token"
): Promise<{ token: string; id: string }> {
  const db = getDb();
  const { token, hash } = generateApiToken();
  const id = nanoid(16);
  const now = nowSeconds();

  await db.execute({
    sql: `INSERT INTO api_tokens (id, token_hash, user_id, name, created_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, hash, userId, name, now],
  });

  return { token, id };
}

// Revoke an API token
export async function revokeApiToken(
  tokenId: string,
  userId: string
): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE api_tokens SET revoked = 1 WHERE id = ? AND user_id = ?`,
    args: [tokenId, userId],
  });
  return result.rowsAffected > 0;
}

// List all API tokens for a user (without the actual token values)
export async function listApiTokens(userId: string): Promise<ApiToken[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, user_id, name, created_at, last_used_at, expires_at, revoked
          FROM api_tokens
          WHERE user_id = ? AND revoked = 0
          ORDER BY created_at DESC`,
    args: [userId],
  });

  return result.rows as unknown as ApiToken[];
}

// Device code functions for CLI auth flow
export interface DeviceCode {
  code: string;
  user_id: string | null;
  token_id: string | null;
  token: string | null;
  created_at: number;
  expires_at: number;
  approved: number;
}

// Create a device code for CLI login
export async function createDeviceCode(): Promise<string> {
  const db = getDb();
  const code = nanoid(16);
  const now = nowSeconds();
  const expiresAt = now + 300; // 5 minutes

  await db.execute({
    sql: `INSERT INTO cli_device_codes (code, created_at, expires_at)
          VALUES (?, ?, ?)`,
    args: [code, now, expiresAt],
  });

  return code;
}

// Get device code status
export async function getDeviceCode(code: string): Promise<DeviceCode | null> {
  const db = getDb();
  const now = nowSeconds();

  const result = await db.execute({
    sql: `SELECT * FROM cli_device_codes WHERE code = ? AND expires_at > ?`,
    args: [code, now],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as unknown as DeviceCode;
}

// Approve a device code (browser calls this after OAuth)
export async function approveDeviceCode(
  code: string,
  userId: string
): Promise<string | null> {
  const db = getDb();
  const now = nowSeconds();

  // Check if code exists and not expired
  const deviceCode = await getDeviceCode(code);
  if (!deviceCode || deviceCode.approved) {
    return null;
  }

  // Create API token for the user
  const { token, id: tokenId } = await createApiToken(userId, "CLI Token");

  // Update device code with approval and store token for CLI to retrieve
  await db.execute({
    sql: `UPDATE cli_device_codes SET approved = 1, user_id = ?, token_id = ?, token = ?
          WHERE code = ? AND expires_at > ?`,
    args: [userId, tokenId, token, code, now],
  });

  return token;
}

// Poll for approved device code (CLI calls this)
export async function pollDeviceCode(
  code: string
): Promise<{ status: "pending" | "approved" | "expired"; token?: string }> {
  const db = getDb();
  const now = nowSeconds();

  const result = await db.execute({
    sql: `SELECT * FROM cli_device_codes WHERE code = ?`,
    args: [code],
  });

  if (result.rows.length === 0) {
    return { status: "expired" };
  }

  const row = result.rows[0] as unknown as DeviceCode;

  if (row.expires_at < now) {
    return { status: "expired" };
  }

  if (!row.approved) {
    return { status: "pending" };
  }

  // Code was approved - return the token and delete the device code
  const token = row.token;
  if (token) {
    // Delete the device code now that the token has been retrieved
    await db.execute({
      sql: `DELETE FROM cli_device_codes WHERE code = ?`,
      args: [code],
    });
  }

  return { status: "approved", token: token ?? undefined };
}

// Clean up expired device codes
export async function cleanupExpiredDeviceCodes(): Promise<number> {
  const db = getDb();
  const now = nowSeconds();
  const result = await db.execute({
    sql: `DELETE FROM cli_device_codes WHERE expires_at <= ?`,
    args: [now],
  });
  return result.rowsAffected;
}
