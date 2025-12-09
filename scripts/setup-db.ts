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
  ],
  "write"
);

console.log("Database schema created successfully!");
