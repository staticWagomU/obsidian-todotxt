import { describe, expect, it } from "vitest";
import { getThresholdDate } from "./threshold";

describe("getThresholdDate", () => {
	describe("正常系: t:YYYY-MM-DD形式のタグからDate型を抽出", () => {
		it("t:2026-01-15が指定されている場合、2026-01-15のDate型を返す", () => {
			const tags = { t: "2026-01-15" };
			const result = getThresholdDate(tags);
			expect(result).toEqual(new Date("2026-01-15"));
		});

		it("複数タグがある中からt:タグを抽出する", () => {
			const tags = { priority: "A", t: "2026-02-20", category: "work" };
			const result = getThresholdDate(tags);
			expect(result).toEqual(new Date("2026-02-20"));
		});

		it("t:2026-12-31が指定されている場合、年末日付を正しく抽出", () => {
			const tags = { t: "2026-12-31" };
			const result = getThresholdDate(tags);
			expect(result).toEqual(new Date("2026-12-31"));
		});

		it("t:2026-01-01が指定されている場合、年始日付を正しく抽出", () => {
			const tags = { t: "2026-01-01" };
			const result = getThresholdDate(tags);
			expect(result).toEqual(new Date("2026-01-01"));
		});
	});

	describe("異常系: t:タグが存在しない、または不正な形式", () => {
		it("t:タグが存在しない場合、nullを返す", () => {
			const tags = { priority: "A", category: "work" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});

		it("空のオブジェクトの場合、nullを返す", () => {
			const tags = {};
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});

		it("t:タグが存在するが日付形式が不正な場合、nullを返す", () => {
			const tags = { t: "invalid-date" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});

		it("t:タグが存在するが空文字の場合、nullを返す", () => {
			const tags = { t: "" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});

		it("t:タグが存在するが不完全な日付の場合、nullを返す", () => {
			const tags = { t: "2026-01" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});
	});

	describe("境界値: 特殊ケース", () => {
		it("t:タグの値が無効な日付の場合、nullを返す（例: 2026-13-01）", () => {
			const tags = { t: "2026-13-01" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});

		it("t:タグの値が無効な日付の場合、nullを返す（例: 2026-02-30）", () => {
			const tags = { t: "2026-02-30" };
			const result = getThresholdDate(tags);
			expect(result).toBeNull();
		});
	});
});
