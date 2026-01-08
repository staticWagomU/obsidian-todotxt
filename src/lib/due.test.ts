import { describe, expect, it } from "vitest";
import { getDueDate, getDueDateStatus } from "./due";

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

describe("getDueDateStatus", () => {
	describe("正常系: 期限日付と現在日付の比較", () => {
		it("期限が過去の日付の場合、'overdue'を返す", () => {
			const dueDate = new Date("2026-01-01");
			const today = new Date("2026-01-10");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("overdue");
		});

		it("期限が本日の場合、'today'を返す", () => {
			const dueDate = new Date("2026-01-09");
			const today = new Date("2026-01-09");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("today");
		});

		it("期限が未来の日付の場合、'future'を返す", () => {
			const dueDate = new Date("2026-01-20");
			const today = new Date("2026-01-10");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("future");
		});

		it("期限が1日前（昨日）の場合、'overdue'を返す", () => {
			const dueDate = new Date("2026-01-08");
			const today = new Date("2026-01-09");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("overdue");
		});

		it("期限が1日後（明日）の場合、'future'を返す", () => {
			const dueDate = new Date("2026-01-10");
			const today = new Date("2026-01-09");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("future");
		});
	});

	describe("境界値: 時刻による日付比較の厳密性", () => {
		it("同日だが時刻が異なる場合も'today'を返す（日付のみで比較）", () => {
			const dueDate = new Date("2026-01-09T08:00:00");
			const today = new Date("2026-01-09T18:00:00");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("today");
		});

		it("年末と年始をまたぐ場合も正しく判定（前年の年末が期限）", () => {
			const dueDate = new Date("2025-12-31");
			const today = new Date("2026-01-01");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("overdue");
		});

		it("年末と年始をまたぐ場合も正しく判定（翌年の年始が期限）", () => {
			const dueDate = new Date("2026-01-01");
			const today = new Date("2025-12-31");
			const result = getDueDateStatus(dueDate, today);
			expect(result).toBe("future");
		});
	});
});

describe("due: integration - タグ抽出から状態判定まで", () => {
	const today = new Date("2026-01-10");

	/**
	 * タグから期限状態を取得するヘルパー関数
	 */
	function getDueDateStatusFromTags(tags: string[], currentDate: Date) {
		const dueDate = getDueDate(tags);
		if (!dueDate) return undefined;
		return getDueDateStatus(dueDate, currentDate);
	}

	describe("期限切れタスク（overdue）の判定", () => {
		it("期限が過去のdue:タグを持つタスクは'overdue'状態", () => {
			const status = getDueDateStatusFromTags(["due:2026-01-01"], today);
			expect(status).toBe("overdue");
		});

		it("期限が1日前のdue:タグを持つタスクは'overdue'状態", () => {
			const status = getDueDateStatusFromTags(["due:2026-01-09"], today);
			expect(status).toBe("overdue");
		});
	});

	describe("本日期限タスク（today）の判定", () => {
		it("期限が本日のdue:タグを持つタスクは'today'状態", () => {
			const status = getDueDateStatusFromTags(["due:2026-01-10"], today);
			expect(status).toBe("today");
		});
	});

	describe("未来の期限タスク（future）の判定", () => {
		it("期限が未来のdue:タグを持つタスクは'future'状態", () => {
			const status = getDueDateStatusFromTags(["due:2026-01-20"], today);
			expect(status).toBe("future");
		});

		it("期限が1日後のdue:タグを持つタスクは'future'状態", () => {
			const status = getDueDateStatusFromTags(["due:2026-01-11"], today);
			expect(status).toBe("future");
		});
	});

	describe("due:タグが存在しない場合", () => {
		it("due:タグがない場合、状態判定は行われない", () => {
			const status = getDueDateStatusFromTags(
				["priority:A", "category:work"],
				today,
			);
			expect(status).toBeUndefined();
		});
	});
});
