import { describe, expect, it, vi, beforeEach } from "vitest";
import {
	createFocusViewContent,
	filterAndSortFocusTodos,
	type FocusViewCallbacks,
} from "./FocusViewModal";
import type { Todo } from "../lib/todo";

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

describe("FocusViewModal", () => {
	describe("filterAndSortFocusTodos", () => {
		const today = new Date("2026-01-20");

		it("due:今日以前のタスクをフィルタし優先度順でソートする", () => {
			const todos = [
				createTodo({ description: "Task B", priority: "B", tags: { due: "2026-01-20" } }),
				createTodo({ description: "Task A", priority: "A", tags: { due: "2026-01-19" } }),
				createTodo({ description: "Future task", tags: { due: "2026-01-25" } }),
			];
			const result = filterAndSortFocusTodos(todos, today);
			expect(result).toHaveLength(2);
			expect(result[0]?.priority).toBe("A");
			expect(result[1]?.priority).toBe("B");
		});

		it("t:今日以前のタスクをフィルタしソートする", () => {
			const todos = [
				createTodo({ description: "Ready task 2", tags: { t: "2026-01-20" } }),
				createTodo({ description: "Ready task 1", tags: { t: "2026-01-19" } }),
				createTodo({ description: "Not ready task", tags: { t: "2026-01-25" } }),
			];
			const result = filterAndSortFocusTodos(todos, today);
			expect(result).toHaveLength(2);
			expect(result.map(t => t.description)).toEqual(["Ready task 1", "Ready task 2"]);
		});

		it("完了タスクは除外される", () => {
			const todos = [
				createTodo({ description: "Incomplete task", completed: false, tags: { due: "2026-01-20" } }),
				createTodo({ description: "Completed task", completed: true, tags: { due: "2026-01-20" } }),
			];
			const result = filterAndSortFocusTodos(todos, today);
			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Incomplete task");
		});

		it("空配列の場合、空配列を返す", () => {
			const result = filterAndSortFocusTodos([], today);
			expect(result).toEqual([]);
		});

		it("条件を満たすタスクがない場合、空配列を返す", () => {
			const todos = [
				createTodo({ description: "Future task", tags: { due: "2026-01-25" } }),
				createTodo({ description: "Completed task", completed: true, tags: { due: "2026-01-20" } }),
			];
			const result = filterAndSortFocusTodos(todos, today);
			expect(result).toEqual([]);
		});
	});

	describe("createFocusViewContent", () => {
		const today = new Date("2026-01-20");
		let mockCallbacks: FocusViewCallbacks;
		let container: HTMLElement;

		beforeEach(() => {
			mockCallbacks = {
				onToggleComplete: vi.fn(),
			};
			container = document.createElement("div");
		});

		it("フォーカスタスクがある場合、リストを表示する", () => {
			const todos = [
				createTodo({ description: "Focus task 1", priority: "A", tags: { due: "2026-01-20" } }),
				createTodo({ description: "Focus task 2", tags: { t: "2026-01-19" } }),
			];
			createFocusViewContent(container, todos, today, mockCallbacks);

			// ヘッダーが表示される
			const header = container.querySelector("h2");
			expect(header?.textContent).toBe("今日のフォーカスタスク");

			// タスク数が表示される
			const countEl = container.querySelector(".focus-view-count");
			expect(countEl?.textContent).toContain("2");

			// タスクアイテムが表示される
			const taskItems = container.querySelectorAll(".focus-view-item");
			expect(taskItems).toHaveLength(2);
		});

		it("フォーカスタスクがない場合、空メッセージを表示する", () => {
			const todos: Todo[] = [];
			createFocusViewContent(container, todos, today, mockCallbacks);

			const emptyMessage = container.querySelector(".focus-view-empty");
			expect(emptyMessage).not.toBeNull();
			expect(emptyMessage?.textContent).toContain("今日のタスクはありません");
		});

		it("タスクアイテムにチェックボックスがある", () => {
			const todos = [
				createTodo({ description: "Task with checkbox", tags: { due: "2026-01-20" } }),
			];
			createFocusViewContent(container, todos, today, mockCallbacks);

			const checkbox = container.querySelector(".focus-view-checkbox");
			expect(checkbox).not.toBeNull();
		});

		it("チェックボックスクリックでonToggleCompleteが呼ばれる", () => {
			const todos = [
				createTodo({ description: "Clickable task", tags: { due: "2026-01-20" } }),
			];
			createFocusViewContent(container, todos, today, mockCallbacks);

			const checkbox = container.querySelector<HTMLInputElement>(".focus-view-checkbox");
			checkbox?.click();

			expect(mockCallbacks.onToggleComplete).toHaveBeenCalledWith(0);
		});

		it("優先度が表示される", () => {
			const todos = [
				createTodo({ description: "Priority task", priority: "A", tags: { due: "2026-01-20" } }),
			];
			createFocusViewContent(container, todos, today, mockCallbacks);

			const priorityEl = container.querySelector(".focus-view-priority");
			expect(priorityEl?.textContent).toBe("(A)");
		});

		it("due:タグが表示される", () => {
			const todos = [
				createTodo({ description: "Due task", tags: { due: "2026-01-20" } }),
			];
			createFocusViewContent(container, todos, today, mockCallbacks);

			const dueEl = container.querySelector(".focus-view-due");
			expect(dueEl?.textContent).toContain("2026-01-20");
		});
	});
});
