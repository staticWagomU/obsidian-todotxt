/**
 * Date utilities tests
 * Tests for date conversion between Date objects and YYYY-MM-DD strings
 */

import { describe, expect, test } from "vitest";
import { dateToString, stringToDate, isSameDateString } from "./date-utils";

describe("dateToString", () => {
	test("Date オブジェクトを YYYY-MM-DD 文字列に変換", () => {
		const date = new Date("2025-01-09T00:00:00Z");
		expect(dateToString(date)).toBe("2025-01-09");
	});

	test("異なるタイムゾーンでも正しく変換", () => {
		const date = new Date("2025-01-09T23:59:59+09:00");
		const result = dateToString(date);
		// YYYY-MM-DD 形式であることを確認
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	test("月と日が1桁の場合、0埋めされる", () => {
		const date = new Date("2025-01-01T00:00:00Z");
		expect(dateToString(date)).toBe("2025-01-01");
	});
});

describe("stringToDate", () => {
	test("YYYY-MM-DD 文字列を Date オブジェクトに変換", () => {
		const date = stringToDate("2025-01-09");
		expect(date).toBeInstanceOf(Date);
		expect(date?.getFullYear()).toBe(2025);
		expect(date?.getMonth()).toBe(0); // 0-indexed
		expect(date?.getDate()).toBe(9);
	});

	test("無効な日付形式の場合、null を返す", () => {
		expect(stringToDate("2025/01/09")).toBe(null);
		expect(stringToDate("invalid")).toBe(null);
		expect(stringToDate("2025-13-01")).toBe(null); // Invalid month
		expect(stringToDate("")).toBe(null);
	});

	test("有効な日付の範囲外の場合、null を返す", () => {
		expect(stringToDate("2025-02-30")).toBe(null); // Feb 30 doesn't exist
		expect(stringToDate("2025-04-31")).toBe(null); // April has 30 days
	});
});

describe("isSameDateString", () => {
	test("同じ日付文字列の場合、true を返す", () => {
		expect(isSameDateString("2025-01-09", "2025-01-09")).toBe(true);
	});

	test("異なる日付文字列の場合、false を返す", () => {
		expect(isSameDateString("2025-01-09", "2025-01-10")).toBe(false);
	});

	test("片方が null/undefined の場合、false を返す", () => {
		expect(isSameDateString("2025-01-09", null)).toBe(false);
		expect(isSameDateString(null, "2025-01-09")).toBe(false);
		expect(isSameDateString(null, null)).toBe(false);
	});

	test("両方が空文字列の場合、true を返す", () => {
		expect(isSameDateString("", "")).toBe(true);
	});
});
