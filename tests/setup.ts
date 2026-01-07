import { createClient, type Client } from "@libsql/client";
import { setTestDb, resetDb } from "../src/lib/db";

let testClient: Client | null = null;

// Create an in-memory SQLite database for testing
export function getTestDb(): Client {
	if (!testClient) {
		testClient = createClient({
			url: "file::memory:",
		});
		// Inject the test client into the db module
		setTestDb(testClient);
	}
	return testClient;
}

// Set up the test database schema
export async function setupTestDb(): Promise<void> {
	const client = getTestDb();

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
				view_key        TEXT,
				user_id         TEXT,
				language        TEXT,
				creator_ip      TEXT
			)`,
			`CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at)`,
			`CREATE TABLE IF NOT EXISTS rate_limits (
				ip_date TEXT PRIMARY KEY,
				count   INTEGER NOT NULL DEFAULT 1
			)`,
			`CREATE TABLE IF NOT EXISTS user (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT NOT NULL UNIQUE,
				emailVerified INTEGER NOT NULL DEFAULT 0,
				image TEXT,
				createdAt INTEGER NOT NULL,
				updatedAt INTEGER NOT NULL
			)`,
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
			`CREATE TABLE IF NOT EXISTS cli_device_codes (
				code TEXT PRIMARY KEY,
				user_id TEXT,
				token_id TEXT,
				token TEXT,
				created_at INTEGER NOT NULL,
				expires_at INTEGER NOT NULL,
				approved INTEGER NOT NULL DEFAULT 0
			)`,
			`CREATE TABLE IF NOT EXISTS reports (
				id          INTEGER PRIMARY KEY AUTOINCREMENT,
				paste_id    TEXT NOT NULL,
				reason      TEXT NOT NULL,
				reporter_ip TEXT NOT NULL,
				created_at  INTEGER NOT NULL,
				resolved    INTEGER NOT NULL DEFAULT 0
			)`,
		],
		"write",
	);
}

// Clean all tables between tests
export async function cleanTestDb(): Promise<void> {
	const client = getTestDb();

	await client.batch(
		[
			`DELETE FROM pastes`,
			`DELETE FROM rate_limits`,
			`DELETE FROM api_tokens`,
			`DELETE FROM cli_device_codes`,
			`DELETE FROM reports`,
			`DELETE FROM user`,
		],
		"write",
	);
}

// Close the test database
export function closeTestDb(): void {
	if (testClient) {
		testClient.close();
		testClient = null;
		resetDb();
	}
}
