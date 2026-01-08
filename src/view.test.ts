import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TodotxtView } from "./view";
import { parseTodoTxt } from "./lib/parser";

// Mock Obsidian modules
vi.mock("obsidian", () => ({
	TextFileView: class {
		data = "";
		leaf: unknown;
		file: unknown = null;

		constructor(leaf: unknown) {
			this.leaf = leaf;
		}

		async onLoadFile(_file: unknown): Promise<void> {}
		async onUnloadFile(_file: unknown): Promise<void> {}
	},
}));

describe("update view after toggle", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("トグル操作でView内のデータが更新される", async () => {
		// Setup initial data
		const initialData = "(A) Call Mom\nBuy milk\nx 2026-01-08 Completed task";
		view.setViewData(initialData, false);

		// Parse todos
		const todos = parseTodoTxt(view.getViewData());
		expect(todos).toHaveLength(3);
		expect(todos[1]?.completed).toBe(false);

		// Get the toggle handler
		const handleToggle = view.getToggleHandler();
		expect(handleToggle).toBeDefined();

		// Mock current time
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		// Toggle the second task (index 1)
		await handleToggle(1);

		// Verify the data is updated
		const updatedData = view.getViewData();
		const updatedTodos = parseTodoTxt(updatedData);
		
		expect(updatedTodos).toHaveLength(3);
		expect(updatedTodos[1]?.completed).toBe(true);
		expect(updatedTodos[1]?.completionDate).toBe("2026-01-08");
		expect(updatedData).toBe("(A) Call Mom\nx 2026-01-08 Buy milk\nx 2026-01-08 Completed task");

		vi.useRealTimers();
	});

	it("トグル操作で完了タスクを未完了に戻せる", async () => {
		const initialData = "x 2026-01-08 Completed task";
		view.setViewData(initialData, false);

		const todos = parseTodoTxt(view.getViewData());
		expect(todos[0]?.completed).toBe(true);

		const handleToggle = view.getToggleHandler();
		
		await handleToggle(0);

		const updatedData = view.getViewData();
		const updatedTodos = parseTodoTxt(updatedData);
		
		expect(updatedTodos[0]?.completed).toBe(false);
		expect(updatedTodos[0]?.completionDate).toBeUndefined();
		expect(updatedData).toBe("Completed task");
	});

	it("複数タスクのうち特定のタスクのみをトグル", async () => {
		const initialData = "Task 1\nTask 2\nTask 3";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleToggle = view.getToggleHandler();
		
		// Toggle middle task
		await handleToggle(1);

		const updatedData = view.getViewData();
		expect(updatedData).toBe("Task 1\nx 2026-01-08 Task 2\nTask 3");

		vi.useRealTimers();
	});

	it("存在しないインデックスをトグルしてもエラーにならない", async () => {
		const initialData = "Task 1";
		view.setViewData(initialData, false);

		const handleToggle = view.getToggleHandler();
		
		// Should not throw
		await expect(handleToggle(99)).resolves.not.toThrow();
		
		// Data should remain unchanged
		expect(view.getViewData()).toBe("Task 1");
	});
});
