import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Error: TURSO_DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = createClient({ url, authToken });

console.log("Setting up database schema...");

await client.batch(
  [
    `CREATE TABLE IF NOT EXISTS pastes (
      id              TEXT PRIMARY KEY,
      content         TEXT NOT NULL,
      created_at      INTEGER NOT NULL,
      expires_at      INTEGER NOT NULL,
      views           INTEGER NOT NULL DEFAULT 0,
      delete_key      TEXT NOT NULL,
      burn_after_read INTEGER NOT NULL DEFAULT 0,
      is_private      INTEGER NOT NULL DEFAULT 0,
      view_key        TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at)`,
    `CREATE TABLE IF NOT EXISTS rate_limits (
      ip_date TEXT PRIMARY KEY,
      count   INTEGER NOT NULL DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      paste_id    TEXT NOT NULL,
      reason      TEXT NOT NULL,
      reporter_ip TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      resolved    INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_reports_paste_id ON reports(paste_id)`,
    `CREATE INDEX IF NOT EXISTS idx_reports_resolved ON reports(resolved)`,
    // BetterAuth tables
    `CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL REFERENCES user(id)
    )`,
    `CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL REFERENCES user(id),
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      accessTokenExpiresAt INTEGER,
      refreshTokenExpiresAt INTEGER,
      scope TEXT,
      password TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )`,
  ],
  "write"
);

console.log("Database schema created successfully!");
