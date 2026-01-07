import { describe, expect, test } from "bun:test";
import {
	parseTTL,
	formatTimeRemaining,
	nowSeconds,
	MIN_TTL,
	DEFAULT_TTL,
	MAX_TTL,
	MAX_TTL_AUTHENTICATED,
} from "../../src/lib/time";

describe("TTL Parsing", () => {
	describe("parseTTL", () => {
		test("returns default TTL for null/undefined", () => {
			expect(parseTTL(null)).toEqual({ seconds: DEFAULT_TTL });
			expect(parseTTL(undefined)).toEqual({ seconds: DEFAULT_TTL });
			expect(parseTTL("")).toEqual({ seconds: DEFAULT_TTL });
		});

		test("parses minutes", () => {
			expect(parseTTL("30m")).toEqual({ seconds: 30 * 60 });
			expect(parseTTL("1m")).toEqual({ seconds: 60 });
			expect(parseTTL("60m")).toEqual({ seconds: 3600 });
		});

		test("parses hours", () => {
			expect(parseTTL("1h")).toEqual({ seconds: 3600 });
			expect(parseTTL("2h")).toEqual({ seconds: 7200 });
			expect(parseTTL("24h")).toEqual({ seconds: 86400 });
		});

		test("parses days", () => {
			expect(parseTTL("1d")).toEqual({ seconds: 86400 });
			expect(parseTTL("7d")).toEqual({ seconds: 7 * 86400 });
		});

		test("parses seconds", () => {
			expect(parseTTL("120s")).toEqual({ seconds: 120 });
		});

		test("parses combined formats", () => {
			expect(parseTTL("1d12h")).toEqual({ seconds: 86400 + 12 * 3600 });
			expect(parseTTL("2h30m")).toEqual({ seconds: 2 * 3600 + 30 * 60 });
			expect(parseTTL("1d2h30m")).toEqual({
				seconds: 86400 + 2 * 3600 + 30 * 60,
			});
		});

		test("parses raw seconds", () => {
			expect(parseTTL("3600")).toEqual({ seconds: 3600 });
			expect(parseTTL("86400")).toEqual({ seconds: 86400 });
		});

		test("enforces minimum TTL", () => {
			const result = parseTTL("10s");
			expect(result.seconds).toBe(MIN_TTL);
			expect(result.warning).toContain("too short");
		});

		test("enforces maximum TTL for anonymous users", () => {
			const result = parseTTL("30d");
			expect(result.seconds).toBe(MAX_TTL);
			expect(result.warning).toContain("too long");
		});

		test("allows longer TTL for authenticated users", () => {
			const result = parseTTL("30d", MAX_TTL_AUTHENTICATED);
			expect(result.seconds).toBe(30 * 86400);
			expect(result.warning).toBeUndefined();
		});

		test("enforces max TTL for authenticated users", () => {
			const result = parseTTL("60d", MAX_TTL_AUTHENTICATED);
			expect(result.seconds).toBe(MAX_TTL_AUTHENTICATED);
			expect(result.warning).toContain("too long");
		});

		test("handles invalid formats", () => {
			const result = parseTTL("invalid");
			expect(result.seconds).toBe(DEFAULT_TTL);
			expect(result.warning).toContain("Invalid TTL format");
		});

		test("is case insensitive", () => {
			expect(parseTTL("1H")).toEqual({ seconds: 3600 });
			expect(parseTTL("1D")).toEqual({ seconds: 86400 });
		});

		test("trims whitespace", () => {
			expect(parseTTL("  1h  ")).toEqual({ seconds: 3600 });
		});
	});

	describe("formatTimeRemaining", () => {
		test("formats days and hours", () => {
			const now = nowSeconds();
			const expiresAt = now + 2 * 86400 + 5 * 3600;
			expect(formatTimeRemaining(expiresAt)).toBe("2d 5h");
		});

		test("formats hours and minutes", () => {
			const now = nowSeconds();
			const expiresAt = now + 3 * 3600 + 30 * 60;
			expect(formatTimeRemaining(expiresAt)).toBe("3h 30m");
		});

		test("formats just days", () => {
			const now = nowSeconds();
			const expiresAt = now + 5 * 86400;
			expect(formatTimeRemaining(expiresAt)).toBe("5d");
		});

		test("formats just hours", () => {
			const now = nowSeconds();
			const expiresAt = now + 12 * 3600;
			expect(formatTimeRemaining(expiresAt)).toBe("12h");
		});

		test("formats just minutes", () => {
			const now = nowSeconds();
			const expiresAt = now + 45 * 60;
			expect(formatTimeRemaining(expiresAt)).toBe("45m");
		});

		test("shows expired for past times", () => {
			const now = nowSeconds();
			expect(formatTimeRemaining(now - 100)).toBe("expired");
		});

		test("shows less than a minute for very short times", () => {
			const now = nowSeconds();
			expect(formatTimeRemaining(now + 30)).toBe("less than a minute");
		});

		test("omits minutes when days are present", () => {
			const now = nowSeconds();
			// 1 day, 0 hours, 30 minutes
			const expiresAt = now + 86400 + 30 * 60;
			expect(formatTimeRemaining(expiresAt)).toBe("1d");
		});
	});

	describe("nowSeconds", () => {
		test("returns current Unix timestamp in seconds", () => {
			const now = nowSeconds();
			const expected = Math.floor(Date.now() / 1000);
			// Allow 1 second tolerance
			expect(Math.abs(now - expected)).toBeLessThanOrEqual(1);
		});

		test("returns an integer", () => {
			const now = nowSeconds();
			expect(Number.isInteger(now)).toBe(true);
		});
	});
});

describe("TTL Constants", () => {
	test("MIN_TTL is 60 seconds", () => {
		expect(MIN_TTL).toBe(60);
	});

	test("DEFAULT_TTL is 24 hours", () => {
		expect(DEFAULT_TTL).toBe(24 * 60 * 60);
	});

	test("MAX_TTL is 7 days", () => {
		expect(MAX_TTL).toBe(7 * 24 * 60 * 60);
	});

	test("MAX_TTL_AUTHENTICATED is 30 days", () => {
		expect(MAX_TTL_AUTHENTICATED).toBe(30 * 24 * 60 * 60);
	});
});
