import { describe, expect, it } from "vitest";
import { getThresholdDate, getThresholdDateStatus } from "./threshold";
import type { Todo } from "./todo";

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

describe("getThresholdDateStatus", () => {
	const createTodo = (tags: Record<string, string>): Todo => ({
		completed: false,
		description: "Test task",
		projects: [],
		contexts: [],
		tags,
		raw: "",
	});

	describe("正常系: しきい値日付と現在日付の比較", () => {
		it("しきい値が未来の日付の場合、'not_ready'を返す", () => {
			const todo = createTodo({ t: "2026-01-20" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("not_ready");
		});

		it("しきい値が本日の場合、'ready'を返す", () => {
			const todo = createTodo({ t: "2026-01-10" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("ready");
		});

		it("しきい値が過去の日付の場合、'ready'を返す", () => {
			const todo = createTodo({ t: "2026-01-01" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("ready");
		});

		it("しきい値が1日後（明日）の場合、'not_ready'を返す", () => {
			const todo = createTodo({ t: "2026-01-11" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("not_ready");
		});

		it("しきい値が1日前（昨日）の場合、'ready'を返す", () => {
			const todo = createTodo({ t: "2026-01-09" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("ready");
		});
	});

	describe("境界値: t:タグが存在しない場合", () => {
		it("t:タグがない場合、nullを返す", () => {
			const todo = createTodo({ priority: "A" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBeNull();
		});

		it("t:タグが不正な形式の場合、nullを返す", () => {
			const todo = createTodo({ t: "invalid-date" });
			const today = new Date("2026-01-10");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBeNull();
		});
	});

	describe("境界値: 時刻による日付比較の厳密性", () => {
		it("同日だが時刻が異なる場合も'ready'を返す（日付のみで比較）", () => {
			const todo = createTodo({ t: "2026-01-10" });
			const today = new Date("2026-01-10T18:00:00");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("ready");
		});

		it("年末と年始をまたぐ場合も正しく判定（前年の年末がしきい値）", () => {
			const todo = createTodo({ t: "2025-12-31" });
			const today = new Date("2026-01-01");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("ready");
		});

		it("年末と年始をまたぐ場合も正しく判定（翌年の年始がしきい値）", () => {
			const todo = createTodo({ t: "2026-01-01" });
			const today = new Date("2025-12-31");
			const result = getThresholdDateStatus(todo, today);
			expect(result).toBe("not_ready");
		});
	});
});

describe("threshold: integration - タグ抽出から状態判定まで", () => {
	const today = new Date("2026-01-10");

	const createTodo = (tags: Record<string, string>): Todo => ({
		completed: false,
		description: "Test task",
		projects: [],
		contexts: [],
		tags,
		raw: "",
	});

	/**
	 * Todoからしきい値状態を取得するヘルパー関数
	 */
	function getThresholdStatusFromTodo(
		todo: Todo,
		currentDate: Date,
	): "not_ready" | "ready" | null {
		return getThresholdDateStatus(todo, currentDate);
	}

	describe("着手不可タスク（not_ready）の判定", () => {
		it("しきい値が未来のt:タグを持つタスクは'not_ready'状態", () => {
			const todo = createTodo({ t: "2026-01-20" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBe("not_ready");
		});

		it("しきい値が1日後のt:タグを持つタスクは'not_ready'状態", () => {
			const todo = createTodo({ t: "2026-01-11" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBe("not_ready");
		});
	});

	describe("着手可能タスク（ready）の判定", () => {
		it("しきい値が本日のt:タグを持つタスクは'ready'状態", () => {
			const todo = createTodo({ t: "2026-01-10" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBe("ready");
		});

		it("しきい値が過去のt:タグを持つタスクは'ready'状態", () => {
			const todo = createTodo({ t: "2026-01-01" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBe("ready");
		});

		it("しきい値が1日前のt:タグを持つタスクは'ready'状態", () => {
			const todo = createTodo({ t: "2026-01-09" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBe("ready");
		});
	});

	describe("t:タグが存在しない場合", () => {
		it("t:タグがない場合、状態判定は行われない", () => {
			const todo = createTodo({ priority: "A", category: "work" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBeNull();
		});

		it("t:タグが不正な形式の場合、状態判定は行われない", () => {
			const todo = createTodo({ t: "invalid-date" });
			const status = getThresholdStatusFromTodo(todo, today);
			expect(status).toBeNull();
		});
	});
});
