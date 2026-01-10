import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TodotxtView } from "./view";
import { parseTodoTxt } from "./lib/parser";

// Mock Obsidian modules
vi.mock("obsidian", () => {
	// Helper to add Obsidian-like createEl method to elements recursively
	// Must be defined inside the factory function due to vi.mock hoisting
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function addCreateElMethod(el: HTMLElement): any {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
		(el as any).createEl = (childTag: string) => {
			const childEl = document.createElement(childTag);
			el.appendChild(childEl);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return addCreateElMethod(childEl);
		};
		return el;
	}

	return {
		TextFileView: class {
			data = "";
			leaf: unknown;
			file: unknown = null;
			app = {}; // Mock app property
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contentEl: any;

			constructor(leaf: unknown) {
				this.leaf = leaf;
				// Create contentEl mock in constructor (after JSDOM is available)
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.empty = () => { container.innerHTML = ""; };
			}

			async onLoadFile(_file: unknown): Promise<void> {}
			async onUnloadFile(_file: unknown): Promise<void> {}
		},
		Modal: class {
			app: unknown;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contentEl: any;

			constructor(app: unknown) {
				this.app = app;
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.empty = () => { container.innerHTML = ""; };
			}

			open(): void {}
			close(): void {}
		},
	};
});

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

describe("update view after task creation", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("新規タスクを追加してViewのデータが更新される", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Buy milk");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n2026-01-08 Buy milk");

		vi.useRealTimers();
	});

	it("空ファイルに新規タスクを追加", async () => {
		view.setViewData("", false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("First task");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("2026-01-08 First task");

		vi.useRealTimers();
	});

	it("優先度付きタスクを追加", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Buy groceries", "B");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-08 Buy groceries");

		vi.useRealTimers();
	});

	it("プロジェクトとコンテキスト付きタスクを追加", async () => {
		view.setViewData("", false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Write report +Work @office", "C");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(C) 2026-01-08 Write report +Work @office");

		vi.useRealTimers();
	});
});

describe("update view after task edit", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("編集後のView更新（モック）", async () => {
		const initialData = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";
		view.setViewData(initialData, false);

		const handleEdit = view.getEditHandler();
		await handleEdit(1, { description: "Buy bread +GroceryShopping", priority: "A" });

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n(A) 2026-01-02 Buy bread +GroceryShopping\n(C) 2026-01-03 Write report");
	});

	it("ファイル保存（setViewData）", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		const handleEdit = view.getEditHandler();
		await handleEdit(0, { description: "Call Mom +Family @phone" });

		// setViewDataが呼ばれてデータが更新される
		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom +Family @phone");
	});

	it("編集前後のTodo比較", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		const todoBefore = parseTodoTxt(view.getViewData())[0];
		expect(todoBefore?.description).toBe("Call Mom");
		expect(todoBefore?.priority).toBe("A");

		const handleEdit = view.getEditHandler();
		await handleEdit(0, { priority: "B" });

		const todoAfter = parseTodoTxt(view.getViewData())[0];
		expect(todoAfter?.description).toBe("Call Mom");
		expect(todoAfter?.priority).toBe("B");
	});

	it("エラーハンドリング（無効な編集）", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		const handleEdit = view.getEditHandler();

		// 範囲外のインデックス
		await handleEdit(99, { description: "Invalid" });

		// データは変更されない
		expect(view.getViewData()).toBe("(A) 2026-01-01 Call Mom");
	});
});

describe("update view after task deletion", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("削除ハンドラを取得して中間タスクを削除できる", async () => {
		const initialData = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";
		view.setViewData(initialData, false);

		const handleDelete = view.getDeleteHandler();
		expect(handleDelete).toBeDefined();

		await handleDelete(1);

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n(C) 2026-01-03 Write report");
	});

	it("削除後のUI更新（タスク数減少）", async () => {
		const initialData = "(A) Task 1\n(B) Task 2\n(C) Task 3";
		view.setViewData(initialData, false);

		const todosBefore = parseTodoTxt(view.getViewData());
		expect(todosBefore).toHaveLength(3);

		const handleDelete = view.getDeleteHandler();
		await handleDelete(0);

		const todosAfter = parseTodoTxt(view.getViewData());
		expect(todosAfter).toHaveLength(2);
		expect(todosAfter[0]?.description).toBe("Task 2");
		expect(todosAfter[1]?.description).toBe("Task 3");
	});

	it("エッジケース: 単一行ファイルのタスク削除で空になる", async () => {
		const initialData = "(A) 2026-01-01 Only task";
		view.setViewData(initialData, false);

		const handleDelete = view.getDeleteHandler();
		await handleDelete(0);

		const updatedData = view.getViewData();
		expect(updatedData).toBe("");
	});

	it("エラー処理: 範囲外インデックスで変更なし", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		const handleDelete = view.getDeleteHandler();

		// 範囲外のインデックス
		await handleDelete(99);

		// データは変更されない
		expect(view.getViewData()).toBe("(A) 2026-01-01 Call Mom");
	});
});

describe("setViewData preserves file data correctly", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("clear=trueでもファイルデータを保持する", () => {
		const fileData = "(A) 2026-01-01 Call Mom\nBuy milk";

		// Simulate Obsidian calling setViewData with clear=true (file reopen)
		view.setViewData(fileData, true);

		// Data should be preserved
		const retrievedData = view.getViewData();
		expect(retrievedData).toBe(fileData);
	});

	it("clear=falseの場合もファイルデータを保持する", () => {
		const fileData = "(A) Task 1\n(B) Task 2";

		view.setViewData(fileData, false);

		const retrievedData = view.getViewData();
		expect(retrievedData).toBe(fileData);
	});

	it("連続してsetViewDataを呼び出しても最新のデータを保持する", () => {
		view.setViewData("First data", true);
		expect(view.getViewData()).toBe("First data");

		view.setViewData("Second data", true);
		expect(view.getViewData()).toBe("Second data");

		view.setViewData("Third data", false);
		expect(view.getViewData()).toBe("Third data");
	});
});

describe("clear parameter is optimization flag only", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("clear=trueでもclear=falseでも同じデータ保持動作をする", () => {
		const testData = "(A) Task with data";

		// Test with clear=true
		view.setViewData(testData, true);
		const dataWithClearTrue = view.getViewData();

		// Reset and test with clear=false
		view.setViewData("", false);
		view.setViewData(testData, false);
		const dataWithClearFalse = view.getViewData();

		// Both should preserve data identically
		expect(dataWithClearTrue).toBe(testData);
		expect(dataWithClearFalse).toBe(testData);
		expect(dataWithClearTrue).toBe(dataWithClearFalse);
	});

	it("clearパラメータの値に関わらずデータが消えない", () => {
		const scenarios = [
			{ data: "Task 1", clear: true },
			{ data: "Task 2", clear: false },
			{ data: "(A) 2026-01-01 Task 3", clear: true },
			{ data: "x 2026-01-01 Completed", clear: false },
		];

		for (const scenario of scenarios) {
			view.setViewData(scenario.data, scenario.clear);
			expect(view.getViewData()).toBe(scenario.data);
		}
	});

	it("clear()メソッドを直接呼んでもデータに影響しない", () => {
		const originalData = "(A) Important task";
		view.setViewData(originalData, false);

		// Directly call clear() - should not affect data
		view.clear();

		// Data should still be preserved
		expect(view.getViewData()).toBe(originalData);
	});
});

describe("getViewData returns correct data for file save", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("setViewDataで設定したデータをgetViewDataで取得できる", () => {
		const fileContent = "(A) 2026-01-01 Call Mom\nBuy milk\nx 2026-01-08 Done task";
		view.setViewData(fileContent, false);

		const retrievedData = view.getViewData();
		expect(retrievedData).toBe(fileContent);
	});

	it("タスク操作後もgetViewDataで最新データを取得できる", async () => {
		view.setViewData("Task 1\nTask 2", false);

		// Simulate adding a task
		const handleAdd = view.getAddHandler();
		const originalData = view.getViewData();

		// Add task modifies data
		await handleAdd("New task", "A");

		const updatedData = view.getViewData();
		expect(updatedData).not.toBe(originalData);
		expect(updatedData).toContain("New task");
	});

	it("複数回のタスク操作後もgetViewDataで正しいデータを返す", async () => {
		const initialData = "(A) Task 1\n(B) Task 2\n(C) Task 3";
		view.setViewData(initialData, false);

		// Delete task
		const handleDelete = view.getDeleteHandler();
		await handleDelete(1);

		let currentData = view.getViewData();
		expect(currentData).toBe("(A) Task 1\n(C) Task 3");

		// Edit task
		const handleEdit = view.getEditHandler();
		await handleEdit(0, { priority: "Z" });

		currentData = view.getViewData();
		expect(currentData).toBe("(Z) Task 1\n(C) Task 3");
	});

	it("空ファイルでもgetViewDataが正しく動作する", () => {
		view.setViewData("", false);
		expect(view.getViewData()).toBe("");
	});

	it("改行のみのデータも正確に返す", () => {
		const dataWithNewlines = "Task 1\n\n\nTask 2";
		view.setViewData(dataWithNewlines, false);
		expect(view.getViewData()).toBe(dataWithNewlines);
	});
});

describe("data persistence after task operations", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("タスク追加後にファイル保存可能なデータが保持される", async () => {
		const initialData = "(A) 2026-01-01 Existing task";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleAdd = view.getAddHandler();
		await handleAdd("New task", "B");

		const savedData = view.getViewData();
		expect(savedData).toBe("(A) 2026-01-01 Existing task\n(B) 2026-01-10 New task");

		vi.useRealTimers();
	});

	it("タスク削除後にファイル保存可能なデータが保持される", async () => {
		const initialData = "Task 1\nTask 2\nTask 3";
		view.setViewData(initialData, false);

		const handleDelete = view.getDeleteHandler();
		await handleDelete(1);

		const savedData = view.getViewData();
		expect(savedData).toBe("Task 1\nTask 3");
	});

	it("タスク編集後にファイル保存可能なデータが保持される", async () => {
		const initialData = "(A) 2026-01-01 Task 1\n(B) 2026-01-02 Task 2";
		view.setViewData(initialData, false);

		const handleEdit = view.getEditHandler();
		await handleEdit(1, { description: "Modified task", priority: "C" });

		const savedData = view.getViewData();
		expect(savedData).toBe("(A) 2026-01-01 Task 1\n(C) 2026-01-02 Modified task");
	});

	it("タスクトグル後にファイル保存可能なデータが保持される", async () => {
		const initialData = "(A) 2026-01-09 Task to complete";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleToggle = view.getToggleHandler();
		await handleToggle(0);

		const savedData = view.getViewData();
		// Data should not be lost after toggle
		expect(savedData).not.toBe("");
		expect(savedData).toContain("x 2026-01-10");
		expect(savedData).toContain("Task to complete");

		vi.useRealTimers();
	});

	it("複数操作の連鎖後もデータが正確に保持される", async () => {
		view.setViewData("(A) 2026-01-09 Task 1\n(B) 2026-01-08 Task 2", false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		// Add task
		const handleAdd = view.getAddHandler();
		await handleAdd("Task 3", "C");

		// Toggle first task
		const handleToggle = view.getToggleHandler();
		await handleToggle(0);

		// Edit second task
		const handleEdit = view.getEditHandler();
		await handleEdit(1, { priority: "Z" });

		// Delete third task
		const handleDelete = view.getDeleteHandler();
		await handleDelete(2);

		const savedData = view.getViewData();
		// Verify data is not lost during multiple operations
		expect(savedData).not.toBe("");
		expect(savedData).toContain("x 2026-01-10");
		expect(savedData).toContain("Task 1");
		expect(savedData).toContain("(Z)");
		expect(savedData).toContain("Task 2");

		vi.useRealTimers();
	});

	it("繰り返しタスクのトグル後もデータが失われない", async () => {
		const initialData = "(A) 2026-01-10 Daily standup rec:+1d";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleToggle = view.getToggleHandler();
		await handleToggle(0);

		const savedData = view.getViewData();
		// Data should not be lost - verify it's not empty and contains completion
		expect(savedData).not.toBe("");
		expect(savedData).toContain("x 2026-01-10");
		expect(savedData).toContain("rec:+1d");

		vi.useRealTimers();
	});

	it("空になったファイルも正しく保存できる", async () => {
		view.setViewData("Only task", false);

		const handleDelete = view.getDeleteHandler();
		await handleDelete(0);

		const savedData = view.getViewData();
		expect(savedData).toBe("");
	});
});

describe("integration test - data preserved on file reopen", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("ファイルを開く→編集→再度開く: データが保持される", async () => {
		// Simulate initial file load (Obsidian calls with clear=true)
		const originalFileContent = "(A) 2026-01-01 Buy milk\n(B) 2026-01-02 Call Mom";
		view.setViewData(originalFileContent, true);

		// Verify initial load
		expect(view.getViewData()).toBe(originalFileContent);

		// User adds a task
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));
		const handleAdd = view.getAddHandler();
		await handleAdd("New task", "C");

		// Get updated content that would be saved to disk
		const updatedContent = view.getViewData();
		expect(updatedContent).not.toBe("");
		expect(updatedContent).toContain("Buy milk");
		expect(updatedContent).toContain("Call Mom");
		expect(updatedContent).toContain("New task");

		// Simulate file reopen (this was causing data loss before the fix)
		view.setViewData(updatedContent, true);

		// Critical: Data should still be there after reopen
		const dataAfterReopen = view.getViewData();
		expect(dataAfterReopen).toBe(updatedContent);
		expect(dataAfterReopen).toContain("Buy milk");
		expect(dataAfterReopen).toContain("Call Mom");
		expect(dataAfterReopen).toContain("New task");

		vi.useRealTimers();
	});

	it("複数回のファイルオープン・クローズサイクル", () => {
		// First open
		const content1 = "Task 1\nTask 2";
		view.setViewData(content1, true);
		expect(view.getViewData()).toBe(content1);

		// Close and reopen with different content
		const content2 = "Task 3\nTask 4\nTask 5";
		view.setViewData(content2, true);
		expect(view.getViewData()).toBe(content2);

		// Close and reopen again
		const content3 = "(A) Important task";
		view.setViewData(content3, true);
		expect(view.getViewData()).toBe(content3);
	});

	it("タスク操作後のファイル再オープンでデータ保持", async () => {
		// Initial file load
		view.setViewData("(A) Task 1\n(B) Task 2\n(C) Task 3", true);

		// Perform multiple operations
		const handleToggle = view.getToggleHandler();
		const handleEdit = view.getEditHandler();
		const handleDelete = view.getDeleteHandler();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		await handleToggle(0);
		await handleEdit(1, { priority: "Z" });
		await handleDelete(2);

		const savedContent = view.getViewData();
		expect(savedContent).not.toBe("");

		// Simulate file reopen with the saved content
		view.setViewData(savedContent, true);

		// Data must be preserved
		const reopenedData = view.getViewData();
		expect(reopenedData).toBe(savedContent);
		expect(reopenedData).toContain("x 2026-01-10");
		expect(reopenedData).toContain("(Z)");

		vi.useRealTimers();
	});

	it("空ファイルのオープン・クローズ", () => {
		// Open empty file
		view.setViewData("", true);
		expect(view.getViewData()).toBe("");

		// Reopen empty file
		view.setViewData("", true);
		expect(view.getViewData()).toBe("");
	});
});

describe("render task list in view", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	// Helper type for mock container
	type MockContainer = HTMLElement & {
		empty: () => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		createEl: any;
	};

	// Helper function to create a mock container
	const createMockContainer = (): MockContainer => {
		const container = document.createElement("div") as MockContainer;

		// Helper function to add createEl method to an element
		const addCreateEl = (element: HTMLElement) => {
			(element as MockContainer).createEl = vi.fn((tag: string) => {
				const el = document.createElement(tag);
				element.appendChild(el);
				addCreateEl(el); // Recursively add createEl to child elements
				return el;
			});
		};

		// Mock Obsidian's empty() and createEl() methods
		container.empty = vi.fn(function (this: HTMLElement) {
			this.innerHTML = "";
		});
		addCreateEl(container);

		return container;
	};

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("空のtodo.txtファイルを読み込んでも例外が発生せず、空のリストが描画される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load empty file and render
		view.setViewData("", false);
		view.renderTaskList();

		// Verify: contentEl.empty() was called
		expect(container.empty).toHaveBeenCalled();

		// Verify: ul element was created
		const ul = container.querySelector("ul");
		expect(ul).not.toBeNull();
		expect(ul?.children.length).toBe(0);
	});

	it("1行のタスク「Buy milk」を含むファイル読み込み時、liタグで「Buy milk」が表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with one task and render
		view.setViewData("Buy milk", false);
		view.renderTaskList();

		// Verify: ul element exists with one li child
		const ul = container.querySelector("ul");
		expect(ul).not.toBeNull();
		expect(ul?.children.length).toBe(1);

		// Verify: li element contains the task description
		const li = ul?.children[0] as HTMLLIElement;
		expect(li.tagName).toBe("LI");
		expect(li.textContent).toContain("Buy milk");
	});

	it("完了タスク「x Buy milk」読み込み時、liタグにcompletedクラスが適用される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with completed task and render
		view.setViewData("x Buy milk", false);
		view.renderTaskList();

		// Verify: ul element exists with one li child
		const ul = container.querySelector("ul");
		expect(ul).not.toBeNull();
		expect(ul?.children.length).toBe(1);

		// Verify: li element has 'completed' class
		const li = ul?.children[0] as HTMLLIElement;
		expect(li.classList.contains("completed")).toBe(true);
		expect(li.textContent).toContain("Buy milk");
	});

	it("setViewData()を2回呼び出しても古いliタグが残らず最新のタスクリストのみ表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load first file and render
		view.setViewData("Task 1\nTask 2", false);
		view.renderTaskList();

		// Verify: First render shows 2 tasks
		let ul = container.querySelector("ul");
		expect(ul?.children.length).toBe(2);

		// Execute: Load second file and render
		view.setViewData("Task 3", false);
		view.renderTaskList();

		// Verify: Second render shows only 1 task (old tasks are cleared)
		ul = container.querySelector("ul");
		expect(ul?.children.length).toBe(1);

		const li = ul?.children[0] as HTMLLIElement;
		expect(li.textContent).toContain("Task 3");
	});

	it("優先度付きタスク「(A) Buy milk」読み込み時、liタグに優先度バッジspan要素が表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with priority task and render
		view.setViewData("(A) Buy milk", false);
		view.renderTaskList();

		// Verify: ul element exists with one li child
		const ul = container.querySelector("ul");
		expect(ul).not.toBeNull();
		expect(ul?.children.length).toBe(1);

		const li = ul?.children[0] as HTMLLIElement;

		// Verify: span element with priority class exists
		const priorityBadge = li.querySelector("span.priority");
		expect(priorityBadge).not.toBeNull();
		expect(priorityBadge?.classList.contains("priority-A")).toBe(true);
		expect(priorityBadge?.textContent).toContain("A");
	});

	it("renderTaskList()が追加ボタン要素を含むこと", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Render task list
		view.setViewData("", false);
		view.renderTaskList();

		// Verify: Add button exists
		const addButton = container.querySelector("button.add-task-button");
		expect(addButton).not.toBeNull();
		expect(addButton?.textContent).toBe("+");
	});

	it("追加ボタンクリックでopenAddTaskModalが呼ばれること", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock openAddTaskModal method
		const openAddTaskModalSpy = vi.spyOn(view, "openAddTaskModal").mockImplementation(() => {});

		// Execute: Render task list
		view.setViewData("", false);
		view.renderTaskList();

		// Click add button
		const addButton = container.querySelector("button.add-task-button");
		addButton?.dispatchEvent(new Event("click"));

		// Verify: openAddTaskModal was called
		expect(openAddTaskModalSpy).toHaveBeenCalled();
	});

	it("各タスクにチェックボックスinput要素が表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks and render
		view.setViewData("Buy milk\n(A) Call Mom\nx 2026-01-08 Completed task", false);
		view.renderTaskList();

		// Verify: ul element exists with 3 li children
		const ul = container.querySelector("ul");
		expect(ul).not.toBeNull();
		expect(ul?.children.length).toBe(3);

		// Verify: Each li contains a checkbox input
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];
		for (const li of liElements) {
			const checkbox = li.querySelector("input[type='checkbox']");
			expect(checkbox).not.toBeNull();
			expect(checkbox?.classList.contains("task-checkbox")).toBe(true);
		}
	});

	it("完了タスクのチェックボックスはchecked状態になる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with completed and incomplete tasks
		view.setViewData("Buy milk\nx 2026-01-08 Completed task", false);
		view.renderTaskList();

		// Verify: ul element exists with 2 li children
		const ul = container.querySelector("ul");
		expect(ul?.children.length).toBe(2);

		// Verify: First task checkbox is unchecked
		const firstLi = ul?.children[0] as HTMLLIElement;
		const firstCheckbox = firstLi.querySelector("input[type='checkbox']") as HTMLInputElement;
		expect(firstCheckbox?.checked).toBe(false);

		// Verify: Second task checkbox is checked
		const secondLi = ul?.children[1] as HTMLLIElement;
		const secondCheckbox = secondLi.querySelector("input[type='checkbox']") as HTMLInputElement;
		expect(secondCheckbox?.checked).toBe(true);
	});

	it("チェックボックスにdata-index属性が設定される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		// Verify: Each checkbox has correct data-index attribute
		const ul = container.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		for (let i = 0; i < liElements.length; i++) {
			const checkbox = liElements[i]?.querySelector("input[type='checkbox']") as HTMLInputElement;
			expect(checkbox?.dataset.index).toBe(String(i));
		}
	});

	it("チェックボックスをクリックするとgetToggleHandlerが呼ばれタスクが完了になる", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with incomplete task
		view.setViewData("Buy milk", false);
		view.renderTaskList();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		// Click checkbox
		const checkbox = container.querySelector("input[type='checkbox']") as HTMLInputElement;
		expect(checkbox).not.toBeNull();
		expect(checkbox.checked).toBe(false);

		checkbox.click();

		// Wait for async handler to complete
		await vi.runAllTimersAsync();

		// Verify: Task is now completed in data
		const updatedData = view.getViewData();
		expect(updatedData).toBe("x 2026-01-10 Buy milk");

		vi.useRealTimers();
	});

	it("完了タスクのチェックボックスをクリックすると未完了に戻る", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with completed task
		view.setViewData("x 2026-01-08 Completed task", false);
		view.renderTaskList();

		vi.useFakeTimers();

		// Click checkbox to uncomplete
		const checkbox = container.querySelector("input[type='checkbox']") as HTMLInputElement;
		expect(checkbox.checked).toBe(true);

		checkbox.click();

		// Wait for async handler
		await vi.runAllTimersAsync();

		// Verify: Task is now incomplete
		const updatedData = view.getViewData();
		expect(updatedData).toBe("Completed task");

		vi.useRealTimers();
	});

	it("複数タスクの特定のチェックボックスをクリックするとそのタスクのみトグルされる", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		// Click second task's checkbox
		const ul = container.querySelector("ul");
		const secondLi = ul?.children[1] as HTMLLIElement;
		const checkbox = secondLi.querySelector("input[type='checkbox']") as HTMLInputElement;

		checkbox.click();
		await vi.runAllTimersAsync();

		// Verify: Only second task is completed
		const updatedData = view.getViewData();
		expect(updatedData).toBe("Task 0\nx 2026-01-10 Task 1\nTask 2");

		vi.useRealTimers();
	});

	it("各タスクに編集ボタンが表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		// Verify: Each li contains an edit button
		const ul = container.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		for (const li of liElements) {
			const editButton = li.querySelector("button.edit-task-button");
			expect(editButton).not.toBeNull();
			expect(editButton?.textContent).toBe("編集");
		}
	});

	it("編集ボタンにdata-index属性が設定される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		// Verify: Each edit button has correct data-index attribute
		const ul = container.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		for (let i = 0; i < liElements.length; i++) {
			const editButton = liElements[i]?.querySelector("button.edit-task-button") as HTMLButtonElement;
			expect(editButton?.dataset.index).toBe(String(i));
		}
	});

	it("編集ボタンをクリックするとopenEditTaskModalが呼ばれる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock openEditTaskModal method
		const openEditTaskModalSpy = vi.spyOn(view, "openEditTaskModal").mockImplementation(() => {});

		// Execute: Load file with task
		view.setViewData("Buy milk", false);
		view.renderTaskList();

		// Click edit button
		const editButton = container.querySelector("button.edit-task-button") as HTMLButtonElement;
		editButton.click();

		// Verify: openEditTaskModal was called with correct index
		expect(openEditTaskModalSpy).toHaveBeenCalledWith(0);
	});

	it("各タスクに削除ボタンが表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		// Verify: Each li contains a delete button
		const ul = container.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		for (const li of liElements) {
			const deleteButton = li.querySelector("button.delete-task-button");
			expect(deleteButton).not.toBeNull();
			expect(deleteButton?.textContent).toBe("削除");
		}
	});

	it("削除ボタンにdata-index属性が設定される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		// Verify: Each delete button has correct data-index attribute
		const ul = container.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		for (let i = 0; i < liElements.length; i++) {
			const deleteButton = liElements[i]?.querySelector("button.delete-task-button") as HTMLButtonElement;
			expect(deleteButton?.dataset.index).toBe(String(i));
		}
	});

	it("削除ボタンをクリックするとgetDeleteHandlerが呼ばれタスクが削除される", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load file with multiple tasks
		view.setViewData("Task 0\nTask 1\nTask 2", false);
		view.renderTaskList();

		vi.useFakeTimers();

		// Click delete button for second task
		const ul = container.querySelector("ul");
		const secondLi = ul?.children[1] as HTMLLIElement;
		const deleteButton = secondLi.querySelector("button.delete-task-button") as HTMLButtonElement;

		deleteButton.click();

		// Wait for async handler
		await vi.runAllTimersAsync();

		// Verify: Second task is deleted
		const updatedData = view.getViewData();
		expect(updatedData).toBe("Task 0\nTask 2");

		vi.useRealTimers();
	});
});
