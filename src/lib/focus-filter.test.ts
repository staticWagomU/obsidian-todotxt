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
});
