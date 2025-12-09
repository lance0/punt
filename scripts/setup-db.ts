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
    // API tokens for CLI authentication
    `CREATE TABLE IF NOT EXISTS api_tokens (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES user(id),
      name TEXT DEFAULT 'CLI Token',
      created_at INTEGER NOT NULL,
      last_used_at INTEGER,
      expires_at INTEGER,
      revoked INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_api_tokens_token_hash ON api_tokens(token_hash)`,
    // CLI device codes for OAuth device flow
    `CREATE TABLE IF NOT EXISTS cli_device_codes (
      code TEXT PRIMARY KEY,
      user_id TEXT,
      token_id TEXT,
      token TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_cli_device_codes_expires ON cli_device_codes(expires_at)`,
  ],
  "write"
);

// Add user_id column to pastes table if it doesn't exist
try {
  await client.execute(`ALTER TABLE pastes ADD COLUMN user_id TEXT REFERENCES user(id)`);
  console.log("Added user_id column to pastes table");
} catch (e) {
  // Column likely already exists
  if (!String(e).includes("duplicate column")) {
    console.log("user_id column already exists or error:", e);
  }
}

// Create index on user_id (separate because it might fail if column doesn't exist)
try {
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_pastes_user_id ON pastes(user_id)`);
} catch (e) {
  // Ignore errors
}

// Add token column to cli_device_codes if it doesn't exist
try {
  await client.execute(`ALTER TABLE cli_device_codes ADD COLUMN token TEXT`);
  console.log("Added token column to cli_device_codes table");
} catch (e) {
  // Column likely already exists
  if (!String(e).includes("duplicate column")) {
    console.log("token column already exists or error:", e);
  }
}

// Add language column to pastes for syntax highlighting
try {
  await client.execute(`ALTER TABLE pastes ADD COLUMN language TEXT`);
  console.log("Added language column to pastes table");
} catch (e) {
  // Column likely already exists
  if (!String(e).includes("duplicate column")) {
    console.log("language column already exists or error:", e);
  }
}

console.log("Database schema created successfully!");
