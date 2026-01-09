/**
 * Priority options tests
 * Tests for priority dropdown options generation and validation
 */

import { describe, expect, test } from "vitest";
import { generatePriorityOptions, isPriorityValid } from "./priority-options";

describe("generatePriorityOptions", () => {
	test("A-Zの26個の優先度とnullを含む27個のオプションを生成", () => {
		const options = generatePriorityOptions();
		expect(options).toHaveLength(27);
		expect(options[0]).toEqual({ label: "なし", value: null });
		expect(options[1]).toEqual({ label: "(A)", value: "A" });
		expect(options[26]).toEqual({ label: "(Z)", value: "Z" });
	});

	test("オプションの値が昇順で並んでいる (null, A, B, ..., Z)", () => {
		const options = generatePriorityOptions();
		const values = options.map((opt) => opt.value);
		expect(values[0]).toBe(null);
		for (let i = 1; i < values.length; i++) {
			expect(values[i]).toBe(String.fromCharCode(64 + i)); // A=65
		}
	});
});

describe("isPriorityValid", () => {
	test("nullは有効な優先度", () => {
		expect(isPriorityValid(null)).toBe(true);
	});

	test("A-Zは有効な優先度", () => {
		for (let i = 0; i < 26; i++) {
			const priority = String.fromCharCode(65 + i); // A-Z
			expect(isPriorityValid(priority)).toBe(true);
		}
	});

	test("小文字a-zは無効な優先度", () => {
		expect(isPriorityValid("a")).toBe(false);
		expect(isPriorityValid("z")).toBe(false);
	});

	test("空文字列は無効な優先度", () => {
		expect(isPriorityValid("")).toBe(false);
	});

	test("2文字以上は無効な優先度", () => {
		expect(isPriorityValid("AB")).toBe(false);
	});

	test("数字は無効な優先度", () => {
		expect(isPriorityValid("1")).toBe(false);
	});
});
