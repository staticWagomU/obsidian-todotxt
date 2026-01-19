import { describe, expect, it } from "vitest";
import { filterFocusTodos } from "./focus-filter";
import type { Todo } from "./todo";

/**
 * Todoオブジェクトを作成するヘルパー関数
 */
function createTodo(overrides: Partial<Todo>): Todo {
	return {
		completed: false,
		description: "Test task",
		projects: [],
		contexts: [],
		tags: {},
		raw: "",
		...overrides,
	};
}

describe("filterFocusTodos", () => {
	describe("AC1: due:が今日以前のタスクがフォーカスビューに表示される", () => {
		const today = new Date("2026-01-20");

		it("due:が今日の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Today task", tags: { due: "2026-01-20" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Today task");
		});

		it("due:が過去（昨日）の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Yesterday task", tags: { due: "2026-01-19" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Yesterday task");
		});

		it("due:が過去（1週間前）の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Old task", tags: { due: "2026-01-13" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Old task");
		});

		it("due:が未来（明日）の場合、フォーカスビューに含まれない", () => {
			const todos = [createTodo({ description: "Tomorrow task", tags: { due: "2026-01-21" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("due:が未来（来週）の場合、フォーカスビューに含まれない", () => {
			const todos = [createTodo({ description: "Next week task", tags: { due: "2026-01-27" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});
	});

	describe("AC2: t:が今日以前のタスクがフォーカスビューに表示される", () => {
		const today = new Date("2026-01-20");

		it("t:が今日の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Today threshold task", tags: { t: "2026-01-20" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Today threshold task");
		});

		it("t:が過去（昨日）の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Yesterday threshold task", tags: { t: "2026-01-19" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Yesterday threshold task");
		});

		it("t:が過去（1週間前）の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Old threshold task", tags: { t: "2026-01-13" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Old threshold task");
		});

		it("t:が未来（明日）の場合、フォーカスビューに含まれない", () => {
			const todos = [createTodo({ description: "Tomorrow threshold task", tags: { t: "2026-01-21" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("t:が未来（来週）の場合、フォーカスビューに含まれない", () => {
			const todos = [createTodo({ description: "Next week threshold task", tags: { t: "2026-01-27" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("due:もt:も今日以前の場合、フォーカスビューに含まれる", () => {
			const todos = [createTodo({ description: "Both dates task", tags: { due: "2026-01-20", t: "2026-01-19" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Both dates task");
		});
	});

	describe("AC3: due:もt:もないタスクはフォーカスビューに表示されない", () => {
		const today = new Date("2026-01-20");

		it("due:もt:もないタスクは除外される", () => {
			const todos = [createTodo({ description: "No date task", tags: {} })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("他のタグのみのタスクは除外される", () => {
			const todos = [createTodo({ description: "Other tags task", tags: { rec: "1w" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("due:が未来でt:がないタスクは除外される", () => {
			const todos = [createTodo({ description: "Future due task", tags: { due: "2026-01-25" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("t:が未来でdue:がないタスクは除外される", () => {
			const todos = [createTodo({ description: "Future threshold task", tags: { t: "2026-01-25" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("複数タスクから条件を満たすものだけ抽出される", () => {
			const todos = [
				createTodo({ description: "No date task", tags: {} }),
				createTodo({ description: "Due today task", tags: { due: "2026-01-20" } }),
				createTodo({ description: "Future task", tags: { due: "2026-01-25" } }),
				createTodo({ description: "Threshold ready task", tags: { t: "2026-01-19" } }),
			];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(2);
			expect(result.map(t => t.description)).toEqual(["Due today task", "Threshold ready task"]);
		});
	});

	describe("AC4: 完了済みタスクはフォーカスビューに表示されない", () => {
		const today = new Date("2026-01-20");

		it("完了済みタスク（due:今日）は除外される", () => {
			const todos = [createTodo({ description: "Completed today task", completed: true, tags: { due: "2026-01-20" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("完了済みタスク（t:今日）は除外される", () => {
			const todos = [createTodo({ description: "Completed threshold task", completed: true, tags: { t: "2026-01-20" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("完了済みタスク（due:過去）は除外される", () => {
			const todos = [createTodo({ description: "Completed overdue task", completed: true, tags: { due: "2026-01-15" } })];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(0);
		});

		it("未完了タスクのみフォーカスビューに含まれる", () => {
			const todos = [
				createTodo({ description: "Incomplete task", completed: false, tags: { due: "2026-01-20" } }),
				createTodo({ description: "Completed task", completed: true, tags: { due: "2026-01-20" } }),
			];
			const result = filterFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Incomplete task");
		});
	});
});
