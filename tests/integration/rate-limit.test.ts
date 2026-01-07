import { describe, expect, test, beforeAll, beforeEach, afterAll } from "bun:test";
import { setupTestDb, cleanTestDb, closeTestDb } from "../setup";
import {
	checkRateLimit,
	checkUserRateLimit,
	incrementRateLimit,
	incrementUserRateLimit,
	checkCliInitRateLimit,
	incrementCliInitRateLimit,
	checkReportRateLimit,
	incrementReportRateLimit,
} from "../../src/lib/rate-limit";

beforeAll(async () => {
	await setupTestDb();
});

beforeEach(async () => {
	await cleanTestDb();
});

afterAll(() => {
	closeTestDb();
});

describe("Anonymous Rate Limiting", () => {
	const testIp = "192.168.1.100";

	describe("checkRateLimit", () => {
		test("allows requests under limit", async () => {
			const result = await checkRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(100);
		});

		test("returns correct remaining count after increments", async () => {
			await incrementRateLimit(testIp);
			await incrementRateLimit(testIp);
			await incrementRateLimit(testIp);

			const result = await checkRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(97);
		});

		test("blocks at limit", async () => {
			// Increment to limit
			for (let i = 0; i < 100; i++) {
				await incrementRateLimit(testIp);
			}

			const result = await checkRateLimit(testIp);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		test("provides reset time", async () => {
			const result = await checkRateLimit(testIp);
			expect(result.resetAt).toBeInstanceOf(Date);
			expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
		});

		test("isolates different IPs", async () => {
			const ip1 = "192.168.1.1";
			const ip2 = "192.168.1.2";

			await incrementRateLimit(ip1);
			await incrementRateLimit(ip1);

			const result1 = await checkRateLimit(ip1);
			const result2 = await checkRateLimit(ip2);

			expect(result1.remaining).toBe(98);
			expect(result2.remaining).toBe(100);
		});
	});

	describe("incrementRateLimit", () => {
		test("creates counter if not exists", async () => {
			await incrementRateLimit(testIp);
			const result = await checkRateLimit(testIp);
			expect(result.remaining).toBe(99);
		});

		test("increments existing counter", async () => {
			await incrementRateLimit(testIp);
			await incrementRateLimit(testIp);
			await incrementRateLimit(testIp);

			const result = await checkRateLimit(testIp);
			expect(result.remaining).toBe(97);
		});
	});
});

describe("User Rate Limiting", () => {
	const testUserId = "user_123";

	describe("checkUserRateLimit", () => {
		test("allows requests under limit", async () => {
			const result = await checkUserRateLimit(testUserId);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(1000);
		});

		test("returns correct remaining count after increments", async () => {
			for (let i = 0; i < 10; i++) {
				await incrementUserRateLimit(testUserId);
			}

			const result = await checkUserRateLimit(testUserId);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(990);
		});

		test("blocks at limit", async () => {
			// Increment to limit
			for (let i = 0; i < 1000; i++) {
				await incrementUserRateLimit(testUserId);
			}

			const result = await checkUserRateLimit(testUserId);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		test("isolates different users", async () => {
			const user1 = "user_1";
			const user2 = "user_2";

			for (let i = 0; i < 5; i++) {
				await incrementUserRateLimit(user1);
			}

			const result1 = await checkUserRateLimit(user1);
			const result2 = await checkUserRateLimit(user2);

			expect(result1.remaining).toBe(995);
			expect(result2.remaining).toBe(1000);
		});
	});
});

describe("CLI Init Rate Limiting", () => {
	const testIp = "10.0.0.1";

	describe("checkCliInitRateLimit", () => {
		test("allows requests under limit (10/minute)", async () => {
			const result = await checkCliInitRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(10);
		});

		test("returns correct remaining after increments", async () => {
			for (let i = 0; i < 3; i++) {
				await incrementCliInitRateLimit(testIp);
			}

			const result = await checkCliInitRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(7);
		});

		test("blocks at limit", async () => {
			for (let i = 0; i < 10; i++) {
				await incrementCliInitRateLimit(testIp);
			}

			const result = await checkCliInitRateLimit(testIp);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});
	});
});

describe("Report Rate Limiting", () => {
	const testIp = "10.0.0.2";

	describe("checkReportRateLimit", () => {
		test("allows requests under limit (5/minute)", async () => {
			const result = await checkReportRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(5);
		});

		test("returns correct remaining after increments", async () => {
			await incrementReportRateLimit(testIp);
			await incrementReportRateLimit(testIp);

			const result = await checkReportRateLimit(testIp);
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(3);
		});

		test("blocks at limit", async () => {
			for (let i = 0; i < 5; i++) {
				await incrementReportRateLimit(testIp);
			}

			const result = await checkReportRateLimit(testIp);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});
	});
});
