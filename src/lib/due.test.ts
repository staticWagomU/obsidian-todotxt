import { describe, expect, it } from "vitest";
import { getDueDate } from "./due";

describe("getDueDate", () => {
	describe("正常系: due:YYYY-MM-DD形式のタグからDate型を抽出", () => {
		it("due:2026-01-15が指定されている場合、2026-01-15のDate型を返す", () => {
			const tags = ["due:2026-01-15"];
			const result = getDueDate(tags);
			expect(result).toEqual(new Date("2026-01-15"));
		});

		it("複数タグがある中からdue:タグを抽出する", () => {
			const tags = ["priority:A", "due:2026-02-20", "category:work"];
			const result = getDueDate(tags);
			expect(result).toEqual(new Date("2026-02-20"));
		});

		it("due:2026-12-31が指定されている場合、年末日付を正しく抽出", () => {
			const tags = ["due:2026-12-31"];
			const result = getDueDate(tags);
			expect(result).toEqual(new Date("2026-12-31"));
		});

		it("due:2026-01-01が指定されている場合、年始日付を正しく抽出", () => {
			const tags = ["due:2026-01-01"];
			const result = getDueDate(tags);
			expect(result).toEqual(new Date("2026-01-01"));
		});
	});

	describe("異常系: due:タグが存在しない、または不正な形式", () => {
		it("due:タグが存在しない場合、undefinedを返す", () => {
			const tags = ["priority:A", "category:work"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});

		it("空の配列の場合、undefinedを返す", () => {
			const tags: string[] = [];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});

		it("due:タグが存在するが日付形式が不正な場合、undefinedを返す", () => {
			const tags = ["due:invalid-date"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});

		it("due:タグが存在するが空文字の場合、undefinedを返す", () => {
			const tags = ["due:"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});

		it("due:タグが存在するが不完全な日付の場合、undefinedを返す", () => {
			const tags = ["due:2026-01"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});
	});

	describe("境界値: 複数のdue:タグや特殊ケース", () => {
		it("複数のdue:タグが存在する場合、最初のdue:タグを採用", () => {
			const tags = ["due:2026-01-15", "due:2026-02-20"];
			const result = getDueDate(tags);
			expect(result).toEqual(new Date("2026-01-15"));
		});

		it("dueで始まるがコロンがない場合、undefinedを返す", () => {
			const tags = ["due2026-01-15"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});

		it("DUE:と大文字の場合、undefinedを返す（小文字のみ対応）", () => {
			const tags = ["DUE:2026-01-15"];
			const result = getDueDate(tags);
			expect(result).toBeUndefined();
		});
	});
});
