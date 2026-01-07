import { describe, expect, test, beforeAll, beforeEach, afterAll } from "bun:test";
import { setupTestDb, cleanTestDb, closeTestDb, getTestDb } from "../setup";
import {
	createPaste,
	getPaste,
	incrementViews,
	deletePaste,
	deletePasteById,
	getUserPastes,
	getUserPasteStats,
	deleteUserPaste,
	extendPasteTTL,
	cleanupExpiredPastes,
} from "../../src/lib/db";
import { generatePasteId, generateDeleteKey, generateViewKey } from "../../src/lib/id";
import { nowSeconds } from "../../src/lib/time";

beforeAll(async () => {
	await setupTestDb();
});

beforeEach(async () => {
	await cleanTestDb();
});

afterAll(() => {
	closeTestDb();
});

describe("Paste Operations", () => {
	describe("createPaste", () => {
		test("creates a paste with required fields", async () => {
			const id = generatePasteId();
			const deleteKey = generateDeleteKey();

			await createPaste({
				id,
				content: "Hello, World!",
				ttlSeconds: 3600,
				deleteKey,
			});

			const paste = await getPaste(id);
			expect(paste).not.toBeNull();
			expect(paste!.id).toBe(id);
			expect(paste!.content).toBe("Hello, World!");
			expect(paste!.delete_key).toBe(deleteKey);
			expect(paste!.views).toBe(0);
			expect(paste!.burn_after_read).toBe(0);
			expect(paste!.is_private).toBe(0);
		});

		test("creates a paste with burn_after_read", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Secret!",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				burnAfterRead: true,
			});

			const paste = await getPaste(id);
			expect(paste!.burn_after_read).toBe(1);
		});

		test("creates a private paste with view key", async () => {
			const id = generatePasteId();
			const viewKey = generateViewKey();

			await createPaste({
				id,
				content: "Private content",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				isPrivate: true,
				viewKey,
			});

			const paste = await getPaste(id);
			expect(paste!.is_private).toBe(1);
			expect(paste!.view_key).toBe(viewKey);
		});

		test("creates a paste with language for syntax highlighting", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "const x = 1;",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				language: "typescript",
			});

			const paste = await getPaste(id);
			expect(paste!.language).toBe("typescript");
		});

		test("creates a paste with user_id", async () => {
			const id = generatePasteId();
			const userId = "user_123";

			// First create a user
			const db = getTestDb();
			const now = nowSeconds();
			await db.execute({
				sql: `INSERT INTO user (id, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
				args: [userId, "Test User", "test@example.com", now, now],
			});

			await createPaste({
				id,
				content: "User paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			const paste = await getPaste(id);
			expect((paste as any).user_id).toBe(userId);
		});

		test("creates a paste with creator_ip", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "IP tracked paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				creatorIp: "192.168.1.1",
			});

			const paste = await getPaste(id);
			expect((paste as any).creator_ip).toBe("192.168.1.1");
		});
	});

	describe("getPaste", () => {
		test("returns null for non-existent paste", async () => {
			const paste = await getPaste("nonexistent");
			expect(paste).toBeNull();
		});

		test("returns null for expired paste", async () => {
			const id = generatePasteId();
			const db = getTestDb();
			const now = nowSeconds();

			// Insert an expired paste directly
			await db.execute({
				sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key)
					  VALUES (?, ?, ?, ?, ?)`,
				args: [id, "Expired content", now - 3600, now - 1, "key"],
			});

			const paste = await getPaste(id);
			expect(paste).toBeNull();
		});

		test("returns paste that is not expired", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Fresh paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
			});

			const paste = await getPaste(id);
			expect(paste).not.toBeNull();
			expect(paste!.content).toBe("Fresh paste");
		});
	});

	describe("incrementViews", () => {
		test("increments view count", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Test",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
			});

			let paste = await getPaste(id);
			expect(paste!.views).toBe(0);

			await incrementViews(id);
			paste = await getPaste(id);
			expect(paste!.views).toBe(1);

			await incrementViews(id);
			await incrementViews(id);
			paste = await getPaste(id);
			expect(paste!.views).toBe(3);
		});
	});

	describe("deletePaste", () => {
		test("deletes paste with correct key", async () => {
			const id = generatePasteId();
			const deleteKey = generateDeleteKey();

			await createPaste({
				id,
				content: "To delete",
				ttlSeconds: 3600,
				deleteKey,
			});

			const result = await deletePaste(id, deleteKey);
			expect(result).toBe(true);

			const paste = await getPaste(id);
			expect(paste).toBeNull();
		});

		test("does not delete paste with wrong key", async () => {
			const id = generatePasteId();
			const deleteKey = generateDeleteKey();

			await createPaste({
				id,
				content: "Protected",
				ttlSeconds: 3600,
				deleteKey,
			});

			const result = await deletePaste(id, "wrong_key");
			expect(result).toBe(false);

			const paste = await getPaste(id);
			expect(paste).not.toBeNull();
		});

		test("returns false for non-existent paste", async () => {
			const result = await deletePaste("nonexistent", "key");
			expect(result).toBe(false);
		});
	});

	describe("deletePasteById", () => {
		test("deletes paste without requiring key", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Admin delete",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
			});

			await deletePasteById(id);

			const paste = await getPaste(id);
			expect(paste).toBeNull();
		});
	});

	describe("cleanupExpiredPastes", () => {
		test("removes only expired pastes", async () => {
			const activeId = generatePasteId();
			const expiredId = generatePasteId();
			const db = getTestDb();
			const now = nowSeconds();

			// Create active paste
			await createPaste({
				id: activeId,
				content: "Active",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
			});

			// Insert expired paste directly
			await db.execute({
				sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key)
					  VALUES (?, ?, ?, ?, ?)`,
				args: [expiredId, "Expired", now - 3600, now - 1, "key"],
			});

			const deleted = await cleanupExpiredPastes();
			expect(deleted).toBe(1);

			// Active paste should still exist (in db, but getPaste checks expiry)
			const active = await getPaste(activeId);
			expect(active).not.toBeNull();
		});
	});
});

describe("User Paste Operations", () => {
	const userId = "user_test";

	beforeEach(async () => {
		// Create test user
		const db = getTestDb();
		const now = nowSeconds();
		await db.execute({
			sql: `INSERT INTO user (id, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
			args: [userId, "Test User", "test@example.com", now, now],
		});
	});

	describe("getUserPastes", () => {
		test("returns only pastes for the user", async () => {
			// Create pastes for our user
			await createPaste({
				id: generatePasteId(),
				content: "User paste 1",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			await createPaste({
				id: generatePasteId(),
				content: "User paste 2",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			// Create paste for another user
			await createPaste({
				id: generatePasteId(),
				content: "Other user paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId: "other_user",
			});

			const pastes = await getUserPastes(userId);
			expect(pastes).toHaveLength(2);
		});

		test("excludes expired pastes", async () => {
			const db = getTestDb();
			const now = nowSeconds();

			// Create active paste
			await createPaste({
				id: generatePasteId(),
				content: "Active",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			// Insert expired paste
			await db.execute({
				sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key, user_id)
					  VALUES (?, ?, ?, ?, ?, ?)`,
				args: [generatePasteId(), "Expired", now - 3600, now - 1, "key", userId],
			});

			const pastes = await getUserPastes(userId);
			expect(pastes).toHaveLength(1);
		});
	});

	describe("getUserPasteStats", () => {
		test("returns correct statistics", async () => {
			const db = getTestDb();
			const now = nowSeconds();

			// Create active pastes with views
			const id1 = generatePasteId();
			const id2 = generatePasteId();

			await createPaste({
				id: id1,
				content: "Paste 1",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			await createPaste({
				id: id2,
				content: "Paste 2",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			// Add some views
			await incrementViews(id1);
			await incrementViews(id1);
			await incrementViews(id2);

			// Insert expired paste
			await db.execute({
				sql: `INSERT INTO pastes (id, content, created_at, expires_at, delete_key, user_id, views)
					  VALUES (?, ?, ?, ?, ?, ?, ?)`,
				args: [generatePasteId(), "Expired", now - 3600, now - 1, "key", userId, 5],
			});

			const stats = await getUserPasteStats(userId);
			expect(stats.totalPastes).toBe(3);
			expect(stats.activePastes).toBe(2);
			expect(stats.totalViews).toBe(8); // 2 + 1 + 5
		});
	});

	describe("deleteUserPaste", () => {
		test("deletes paste owned by user", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "User paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			const result = await deleteUserPaste(id, userId);
			expect(result).toBe(true);

			const paste = await getPaste(id);
			expect(paste).toBeNull();
		});

		test("does not delete paste owned by another user", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Other user paste",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId: "other_user",
			});

			const result = await deleteUserPaste(id, userId);
			expect(result).toBe(false);
		});
	});

	describe("extendPasteTTL", () => {
		test("extends TTL for user's paste", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "To extend",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId,
			});

			const pasteBefore = await getPaste(id);
			const expiresAtBefore = pasteBefore!.expires_at;

			const result = await extendPasteTTL(id, userId, 7200);
			expect(result).toBe(true);

			const pasteAfter = await getPaste(id);
			expect(pasteAfter!.expires_at).toBe(expiresAtBefore + 7200);
		});

		test("does not extend TTL for another user's paste", async () => {
			const id = generatePasteId();

			await createPaste({
				id,
				content: "Other user",
				ttlSeconds: 3600,
				deleteKey: generateDeleteKey(),
				userId: "other_user",
			});

			const result = await extendPasteTTL(id, userId, 7200);
			expect(result).toBe(false);
		});
	});
});
