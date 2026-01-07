import { describe, expect, test } from "bun:test";
import {
	generatePasteId,
	generateDeleteKey,
	generateViewKey,
} from "../../src/lib/id";

describe("ID Generation", () => {
	describe("generatePasteId", () => {
		test("returns a 7-character string", () => {
			const id = generatePasteId();
			expect(id).toHaveLength(7);
		});

		test("returns URL-safe characters only", () => {
			const id = generatePasteId();
			// nanoid uses A-Za-z0-9_-
			expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
		});

		test("generates unique IDs", () => {
			const ids = new Set<string>();
			for (let i = 0; i < 100; i++) {
				ids.add(generatePasteId());
			}
			expect(ids.size).toBe(100);
		});
	});

	describe("generateDeleteKey", () => {
		test("returns a 32-character string", () => {
			const key = generateDeleteKey();
			expect(key).toHaveLength(32);
		});

		test("returns URL-safe characters only", () => {
			const key = generateDeleteKey();
			expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
		});

		test("generates unique keys", () => {
			const keys = new Set<string>();
			for (let i = 0; i < 100; i++) {
				keys.add(generateDeleteKey());
			}
			expect(keys.size).toBe(100);
		});
	});

	describe("generateViewKey", () => {
		test("returns a 16-character string", () => {
			const key = generateViewKey();
			expect(key).toHaveLength(16);
		});

		test("returns URL-safe characters only", () => {
			const key = generateViewKey();
			expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
		});

		test("generates unique keys", () => {
			const keys = new Set<string>();
			for (let i = 0; i < 100; i++) {
				keys.add(generateViewKey());
			}
			expect(keys.size).toBe(100);
		});
	});
});
