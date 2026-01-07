import { describe, expect, test } from "bun:test";
import { generateApiToken, hashToken } from "../../src/lib/tokens";

describe("Token Generation", () => {
	describe("generateApiToken", () => {
		test("returns token with punt_ prefix", async () => {
			const { token } = await generateApiToken();
			expect(token.startsWith("punt_")).toBe(true);
		});

		test("returns token with 37 total characters (punt_ + 32)", async () => {
			const { token } = await generateApiToken();
			expect(token).toHaveLength(37); // "punt_" (5) + 32
		});

		test("returns URL-safe characters after prefix", async () => {
			const { token } = await generateApiToken();
			const suffix = token.slice(5);
			expect(suffix).toMatch(/^[A-Za-z0-9_-]+$/);
		});

		test("returns a hash alongside the token", async () => {
			const { token, hash } = await generateApiToken();
			expect(token).toBeDefined();
			expect(hash).toBeDefined();
		});

		test("generates unique tokens", async () => {
			const tokens = new Set<string>();
			for (let i = 0; i < 50; i++) {
				const { token } = await generateApiToken();
				tokens.add(token);
			}
			expect(tokens.size).toBe(50);
		});
	});

	describe("hashToken", () => {
		test("returns 64-character hex string (SHA-256)", async () => {
			const hash = await hashToken("test_token");
			expect(hash).toHaveLength(64);
			expect(hash).toMatch(/^[a-f0-9]+$/);
		});

		test("returns same hash for same input", async () => {
			const hash1 = await hashToken("punt_testtoken123");
			const hash2 = await hashToken("punt_testtoken123");
			expect(hash1).toBe(hash2);
		});

		test("returns different hash for different input", async () => {
			const hash1 = await hashToken("punt_token1");
			const hash2 = await hashToken("punt_token2");
			expect(hash1).not.toBe(hash2);
		});

		test("hash matches expected SHA-256 output", async () => {
			// Known SHA-256 hash of "test"
			const hash = await hashToken("test");
			expect(hash).toBe(
				"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
			);
		});

		test("handles empty string", async () => {
			const hash = await hashToken("");
			expect(hash).toHaveLength(64);
		});

		test("handles unicode characters", async () => {
			const hash = await hashToken("token_with_emoji_🚀");
			expect(hash).toHaveLength(64);
			expect(hash).toMatch(/^[a-f0-9]+$/);
		});
	});
});
