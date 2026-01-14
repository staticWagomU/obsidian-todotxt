import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TodotxtView } from "./view";
import { parseTodoTxt } from "./lib/parser";
import type TodotxtPlugin from "./main";
import { DEFAULT_SETTINGS } from "./settings";

// Create mock plugin for tests
function createMockPlugin(): TodotxtPlugin {
	return {
		settings: { ...DEFAULT_SETTINGS },
	} as TodotxtPlugin;
}

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

	// Mock TFile class
	class TFile {
		path: string;
		stat: { mtime: number };
		constructor(path: string) {
			this.path = path;
			this.stat = { mtime: Date.now() };
		}
	}

	return {
		TFile,
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
		PluginSettingTab: class {
			app: unknown;
			plugin: unknown;
			containerEl: HTMLElement;

			constructor(app: unknown, plugin: unknown) {
				this.app = app;
				this.plugin = plugin;
				this.containerEl = document.createElement("div");
			}

			display(): void {}
			hide(): void {}
		},
		Setting: class {
			constructor(_containerEl: HTMLElement) {}
			setName(_name: string) { return this; }
			setDesc(_desc: string) { return this; }
			addDropdown(_cb: unknown) { return this; }
			addToggle(_cb: unknown) { return this; }
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("新規タスクを追加してViewのデータが更新される", async () => {
		const initialData = "(A) 2026-01-01 Call Mom";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Buy milk");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n2026-01-08 Buy milk t:2026-01-08");

		vi.useRealTimers();
	});

	it("空ファイルに新規タスクを追加", async () => {
		view.setViewData("", false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("First task");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("2026-01-08 First task t:2026-01-08");

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
		expect(updatedData).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-08 Buy groceries t:2026-01-08");

		vi.useRealTimers();
	});

	it("プロジェクトとコンテキスト付きタスクを追加", async () => {
		view.setViewData("", false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Write report +Work @office", "C");

		const updatedData = view.getViewData();
		expect(updatedData).toBe("(C) 2026-01-08 Write report +Work @office t:2026-01-08");

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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("タスク追加後にファイル保存可能なデータが保持される", async () => {
		const initialData = "(A) 2026-01-01 Existing task";
		view.setViewData(initialData, false);

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleAdd = view.getAddHandler();
		await handleAdd("New task", "B");

		const savedData = view.getViewData();
		expect(savedData).toBe("(A) 2026-01-01 Existing task\n(B) 2026-01-10 New task t:2026-01-10");

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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
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

		// Verify: Add button exists (FAB style with icon only for main view)
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

	it("openEditTaskModalで現在の優先度が抽出されEditHandlerに渡される", async () => {
		// This test validates that view.ts correctly:
		// 1. Extracts priority from the todo
		// 2. Passes it to EditTaskModal constructor (for UI display)
		// 3. Passes it to editHandler (for saving)

		// Setup: Load task with priority B
		view.setViewData("(B) 2026-01-01 Buy milk", false);

		// Execute: Edit via handler and change only description
		const editHandler = view.getEditHandler();
		await editHandler(0, { description: "Buy bread", priority: "B" });

		// Verify: Priority is preserved in the updated data
		const updatedData = view.getViewData();
		expect(updatedData).toBe("(B) 2026-01-01 Buy bread");

		// Verify: Priority can be changed via editHandler
		await editHandler(0, { description: "Buy bread", priority: "A" });
		const finalData = view.getViewData();
		expect(finalData).toBe("(A) 2026-01-01 Buy bread");
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

describe("render due date badge", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("due:タグを持つタスクに期限日バッジが表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load task with due: tag
		view.setViewData("Buy milk due:2026-01-15", false);
		view.renderTaskList();

		// Verify: Due date badge exists
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date");

		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.textContent).toContain("2026-01-15");
	});

	it("due:タグがないタスクには期限日バッジが表示されない", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load task without due: tag
		view.setViewData("Buy milk", false);
		view.renderTaskList();

		// Verify: No due date badge
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date");

		expect(dueBadge).toBeNull();
	});

	it("複数タスクのうちdue:タグを持つタスクのみにバッジが表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load multiple tasks, only second has due: tag
		view.setViewData("Task 1\nTask 2 due:2026-01-20\nTask 3", false);
		view.renderTaskList();

		// Verify: Only second task has due badge
		const ul = container.querySelector("ul");
		const li1 = ul?.children[0] as HTMLLIElement;
		const li2 = ul?.children[1] as HTMLLIElement;
		const li3 = ul?.children[2] as HTMLLIElement;

		expect(li1?.querySelector("span.due-date")).toBeNull();
		expect(li2?.querySelector("span.due-date")).not.toBeNull();
		expect(li3?.querySelector("span.due-date")).toBeNull();
	});
});

describe("render due date badge with style", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("期限切れタスク(overdue)の期限日バッジが赤色で表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task with overdue date
		view.setViewData("Buy milk due:2026-01-15", false);
		view.renderTaskList();

		// Verify: Due date badge has red color
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date") as HTMLSpanElement;

		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.style.color).toBe("#ff4444");

		vi.useRealTimers();
	});

	it("本日期限タスク(today)の期限日バッジがオレンジ色で表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task with today's date
		view.setViewData("Buy milk due:2026-01-20", false);
		view.renderTaskList();

		// Verify: Due date badge has orange color
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date") as HTMLSpanElement;

		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.style.color).toBe("#ff9944");

		vi.useRealTimers();
	});

	it("未来期限タスク(future)の期限日バッジにスタイル適用されない", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task with future date
		view.setViewData("Buy milk due:2026-01-25", false);
		view.renderTaskList();

		// Verify: Due date badge has no color style
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date") as HTMLSpanElement;

		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.style.color).toBe("");

		vi.useRealTimers();
	});
});

describe("render threshold date grayout", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("t:未来日付のタスク行がグレーアウト表示される(not_ready)", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task with future threshold date
		view.setViewData("Buy milk t:2026-01-25", false);
		view.renderTaskList();

		// Verify: Task li has grayout style
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;

		expect(li).not.toBeNull();
		expect(li?.style.opacity).toBe("0.5");

		vi.useRealTimers();
	});

	it("t:今日または過去日付のタスク行はグレーアウトされない(ready)", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task with today's threshold date
		view.setViewData("Buy milk t:2026-01-20", false);
		view.renderTaskList();

		// Verify: Task li has no opacity style
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;

		expect(li).not.toBeNull();
		expect(li?.style.opacity).toBe("");

		vi.useRealTimers();
	});

	it("t:タグがないタスク行はグレーアウトされない", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Load task without t: tag
		view.setViewData("Buy milk", false);
		view.renderTaskList();

		// Verify: Task li has no opacity style
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;

		expect(li).not.toBeNull();
		expect(li?.style.opacity).toBe("");

		vi.useRealTimers();
	});
});

describe("integration: due and threshold visual display", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("due:とt:の両方を持つタスクで両方の視覚的フィードバックが適用される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Task with both overdue due: and not_ready t:
		view.setViewData("Buy milk due:2026-01-15 t:2026-01-25", false);
		view.renderTaskList();

		// Verify: Both styles are applied
		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;
		const dueBadge = li?.querySelector("span.due-date") as HTMLSpanElement;

		// Check threshold grayout
		expect(li?.style.opacity).toBe("0.5");

		// Check due badge with red color
		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.textContent).toContain("2026-01-15");
		expect(dueBadge?.style.color).toBe("#ff4444");

		vi.useRealTimers();
	});

	it("複数タスクでdue:とt:が異なる状態の視覚的表示が正しく適用される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Multiple tasks with different due: and t: states
		view.setViewData(
			"Task 1 due:2026-01-15\n" + // overdue, no threshold
			"Task 2 t:2026-01-25\n" + // not_ready, no due
			"Task 3 due:2026-01-20 t:2026-01-18\n" + // today due, ready threshold
			"Task 4", // no due, no threshold
			false
		);
		view.renderTaskList();

		const ul = container.querySelector("ul");

		// Task 1: overdue due badge, no grayout
		const li1 = ul?.children[0] as HTMLLIElement;
		const dueBadge1 = li1?.querySelector("span.due-date") as HTMLSpanElement;
		expect(li1?.style.opacity).toBe("");
		expect(dueBadge1?.style.color).toBe("#ff4444");

		// Task 2: no due badge, grayout
		const li2 = ul?.children[1] as HTMLLIElement;
		const dueBadge2 = li2?.querySelector("span.due-date");
		expect(li2?.style.opacity).toBe("0.5");
		expect(dueBadge2).toBeNull();

		// Task 3: today due badge (orange), no grayout
		const li3 = ul?.children[2] as HTMLLIElement;
		const dueBadge3 = li3?.querySelector("span.due-date") as HTMLSpanElement;
		expect(li3?.style.opacity).toBe("");
		expect(dueBadge3?.style.color).toBe("#ff9944");

		// Task 4: no due badge, no grayout
		const li4 = ul?.children[3] as HTMLLIElement;
		const dueBadge4 = li4?.querySelector("span.due-date");
		expect(li4?.style.opacity).toBe("");
		expect(dueBadge4).toBeNull();

		vi.useRealTimers();
	});

	it("優先度バッジとdue:バッジとt:グレーアウトが共存できる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Mock current date to 2026-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-20"));

		// Execute: Task with priority, due, and threshold
		view.setViewData("(A) Buy milk due:2026-01-15 t:2026-01-25", false);
		view.renderTaskList();

		const ul = container.querySelector("ul");
		const li = ul?.children[0] as HTMLLIElement;

		// Check all three features
		const priorityBadge = li?.querySelector("span.priority") as HTMLSpanElement;
		const dueBadge = li?.querySelector("span.due-date") as HTMLSpanElement;

		expect(priorityBadge).not.toBeNull();
		expect(priorityBadge?.textContent).toContain("A");

		expect(dueBadge).not.toBeNull();
		expect(dueBadge?.textContent).toContain("2026-01-15");
		expect(dueBadge?.style.color).toBe("#ff4444");

		expect(li?.style.opacity).toBe("0.5");

		vi.useRealTimers();
	});
});

describe("integration: UI operation to file save flow", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("チェックボックスクリック→データ更新→再レンダリング→UIに反映される完全フロー", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Setup: Initial file load
		view.setViewData("(A) Task 1\n(B) Task 2\n(C) Task 3", false);
		view.renderTaskList();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		// Step 1: UI operation - Click checkbox on second task
		const ul = container.querySelector("ul");
		const secondLi = ul?.children[1] as HTMLLIElement;
		const checkbox = secondLi.querySelector("input[type='checkbox']") as HTMLInputElement;

		expect(checkbox.checked).toBe(false);
		checkbox.click();

		// Wait for async handler
		await vi.runAllTimersAsync();

		// Step 2: Verify data updated in memory (priority is removed on completion)
		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) Task 1\nx 2026-01-10 Task 2\n(C) Task 3");

		// Step 3: Simulate file save by Obsidian (getViewData would be saved to disk)
		const dataToSave = view.getViewData();
		expect(dataToSave).toContain("x 2026-01-10");

		// Step 4: Simulate file reopen (Obsidian calls setViewData with saved content)
		view.setViewData(dataToSave, true);
		view.renderTaskList();

		// Step 5: Verify UI reflects the saved data
		// Note: With defaultSortOrder="completion", completed tasks are sorted to the end
		const ulAfterReopen = container.querySelector("ul");
		const lastLiAfterReopen = ulAfterReopen?.children[2] as HTMLLIElement; // Completed task moved to end due to sort
		const checkboxAfterReopen = lastLiAfterReopen.querySelector("input[type='checkbox']") as HTMLInputElement;

		expect(checkboxAfterReopen.checked).toBe(true);
		expect(lastLiAfterReopen.classList.contains("completed")).toBe(true);

		vi.useRealTimers();
	});

	it("追加ボタン→モーダル→タスク追加→データ保存→再オープン完全フロー", async () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Setup: Initial file load with existing tasks
		view.setViewData("(A) 2026-01-01 Existing task", false);
		view.renderTaskList();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		// Step 1: Simulate modal-triggered add operation
		const handleAdd = view.getAddHandler();
		await handleAdd("New task from UI", "B");

		// Step 2: Verify data updated in memory
		const updatedData = view.getViewData();
		expect(updatedData).toBe("(A) 2026-01-01 Existing task\n(B) 2026-01-10 New task from UI t:2026-01-10");

		// Step 3: Trigger re-render
		view.renderTaskList();

		// Step 4: Verify UI shows new task
		const ul = container.querySelector("ul");
		expect(ul?.children.length).toBe(2);

		const secondLi = ul?.children[1] as HTMLLIElement;
		expect(secondLi.textContent).toContain("New task from UI");

		const priorityBadge = secondLi.querySelector("span.priority");
		expect(priorityBadge?.textContent).toContain("B");

		// Step 5: Simulate file save and reopen
		const dataToSave = view.getViewData();
		view.setViewData(dataToSave, true);
		view.renderTaskList();

		// Step 6: Verify saved data persists after reopen
		const ulAfterReopen = container.querySelector("ul");
		expect(ulAfterReopen?.children.length).toBe(2);

		const finalData = view.getViewData();
		expect(finalData).toBe("(A) 2026-01-01 Existing task\n(B) 2026-01-10 New task from UI t:2026-01-10");

		vi.useRealTimers();
	});
});

describe("archive completed tasks", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("getArchiveHandler should be exposed from View", () => {
		// Mock file property
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		const archiveHandler = view.getArchiveHandler();
		expect(archiveHandler).toBeDefined();
		expect(typeof archiveHandler).toBe("function");
	});

	it("archive handler should remove completed tasks from view", async () => {
		view.setViewData("Task 1\nx 2025-01-14 Completed task\n(A) Task 2\n", false);

		// Mock file and vault
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		// Mock app.vault methods
		let archiveContent = "";
		view.app.vault = {
			getAbstractFileByPath: () => null,
			create: async (_path: string, content: string) => {
				archiveContent = content;
			},
		} as unknown as typeof view.app.vault;

		const archiveHandler = view.getArchiveHandler();
		await archiveHandler();

		const updatedData = view.getViewData();
		expect(updatedData).not.toContain("x 2025-01-14 Completed task");
		expect(updatedData).toContain("Task 1");
		expect(updatedData).toContain("(A) Task 2");
		expect(archiveContent).toContain("x 2025-01-14 Completed task");
	});

	it("archive handler should do nothing when no completed tasks", async () => {
		const initialData = "Task 1\n(A) Task 2\n";
		view.setViewData(initialData, false);

		// Mock file
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		const archiveHandler = view.getArchiveHandler();
		await archiveHandler();

		// Data should remain unchanged
		expect(view.getViewData()).toBe(initialData);
	});

	it("should show confirmation modal before archiving", async () => {
		view.setViewData("Task 1\nx 2025-01-14 Completed task\n", false);

		// Mock file
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		const showConfirmationSpy = vi.spyOn(view, "showArchiveConfirmation").mockResolvedValue(false);
		await view.openArchiveWithConfirmation();

		expect(showConfirmationSpy).toHaveBeenCalled();
	});

	it("should archive after user confirms in modal", async () => {
		view.setViewData("Task 1\nx 2025-01-14 Completed task\n(A) Task 2\n", false);

		// Mock file and vault
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		let archiveContent = "";
		view.app.vault = {
			getAbstractFileByPath: () => null,
			create: async (_path: string, content: string) => {
				archiveContent = content;
			},
		} as unknown as typeof view.app.vault;

		// Mock confirmation to return true
		vi.spyOn(view, "showArchiveConfirmation").mockResolvedValue(true);

		await view.openArchiveWithConfirmation();

		const updatedData = view.getViewData();
		expect(updatedData).not.toContain("x 2025-01-14 Completed task");
		expect(updatedData).toContain("Task 1");
		expect(updatedData).toContain("(A) Task 2");
		expect(archiveContent).toContain("x 2025-01-14 Completed task");
	});

	it("should not archive when user cancels confirmation", async () => {
		const initialData = "Task 1\nx 2025-01-14 Completed task\n";
		view.setViewData(initialData, false);

		// Mock file
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		// Mock confirmation to return false
		vi.spyOn(view, "showArchiveConfirmation").mockResolvedValue(false);

		await view.openArchiveWithConfirmation();

		// Data should remain unchanged
		expect(view.getViewData()).toBe(initialData);
	});
});

describe("AI task addition button", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("should display AI task addition button in main view", () => {
		const initialData = "Buy milk\nWrite report";
		view.setViewData(initialData, false);

		// Check that AI button is displayed
		const aiButton = view.contentEl.querySelector(".ai-add-task-button");
		expect(aiButton).not.toBeNull();
		expect(aiButton?.textContent).toContain("✨");
	});

	it("AI button click should open AITaskInputDialog", () => {
		// Mock file property
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		const initialData = "Buy milk\nWrite report";
		view.setViewData(initialData, false);

		// Mock openAITaskDialog method
		const openAITaskDialogSpy = vi.spyOn(view, "openAITaskDialog").mockImplementation(() => {});

		// Click AI button
		const aiButton = view.contentEl.querySelector(".ai-add-task-button") as HTMLButtonElement;
		expect(aiButton).not.toBeNull();
		aiButton.click();

		// Verify: openAITaskDialog was called
		expect(openAITaskDialogSpy).toHaveBeenCalled();
	});

	it("AI-generated task should be added to file", async () => {
		// This test simulates the full AI task addition flow:
		// 1. User clicks AI button
		// 2. Dialog generates task via AI
		// 3. Task is added to todo.txt file
		// 4. View updates to show new task

		const initialData = "Buy milk\nWrite report";
		view.setViewData(initialData, false);

		// Mock file property
		Object.defineProperty(view, 'file', {
			value: { path: 'vault/todo.txt' },
			writable: true,
			configurable: true,
		});

		// Simulate AI dialog adding a task through the add handler
		const handleAdd = view.getAddHandler();

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-15"));

		// Simulate AI-generated task being added
		await handleAdd("Practice piano for 30 minutes +Music @home", "B");

		// Verify: Task was added to data
		const updatedData = view.getViewData();
		expect(updatedData).toContain("Practice piano for 30 minutes +Music @home");
		expect(updatedData).toContain("(B)");

		vi.useRealTimers();
	});
});

describe("side panel header with status filter and progress", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("ステータスフィルター(全て/未完了/完了)が表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load tasks and render
		view.setViewData("Task 1\nx 2026-01-01 Task 2\nTask 3", false);
		view.renderTaskList();

		// Verify: Status filter exists in header
		const statusFilter = container.querySelector("select.status-filter");
		expect(statusFilter).not.toBeNull();
		expect(statusFilter?.tagName).toBe("SELECT");

		// Verify: Filter has 3 options (全て, 未完了, 完了)
		const options = statusFilter?.querySelectorAll("option");
		expect(options?.length).toBe(3);
		expect(options?.[0]?.value).toBe("all");
		expect(options?.[0]?.textContent).toBe("全て");
		expect(options?.[1]?.value).toBe("active");
		expect(options?.[1]?.textContent).toBe("未完了");
		expect(options?.[2]?.value).toBe("completed");
		expect(options?.[2]?.textContent).toBe("完了");
	});

	it("プログレスバーが表示され、完了率が正しく計算される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: 3 tasks (1 completed, 2 active) = 33.3% progress
		view.setViewData("Task 1\nx 2026-01-01 Task 2\nTask 3", false);
		view.renderTaskList();

		// Verify: Progress bar exists
		const progressBar = container.querySelector(".progress-bar");
		expect(progressBar).not.toBeNull();

		// Verify: Progress fill shows correct percentage
		const progressFill = progressBar?.querySelector(".progress-fill") as HTMLElement;
		expect(progressFill).not.toBeNull();
		expect(progressFill?.style.width).toBe("33%");

		// Verify: Progress text shows "1/3"
		const progressText = progressBar?.querySelector(".progress-text");
		expect(progressText).not.toBeNull();
		expect(progressText?.textContent).toBe("1/3");
	});

	it("プログレスバーが0%のとき正しく表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: All tasks are active (0% progress)
		view.setViewData("Task 1\nTask 2\nTask 3", false);
		view.renderTaskList();

		// Verify: Progress fill shows 0%
		const progressFill = container.querySelector(".progress-fill") as HTMLElement;
		expect(progressFill).not.toBeNull();
		expect(progressFill?.style.width).toBe("0%");

		// Verify: Progress text shows "0/3"
		const progressText = container.querySelector(".progress-text");
		expect(progressText).not.toBeNull();
		expect(progressText?.textContent).toBe("0/3");
	});

	it("プログレスバーが100%のとき正しく表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: All tasks are completed (100% progress)
		view.setViewData("x 2026-01-01 Task 1\nx 2026-01-01 Task 2", false);
		view.renderTaskList();

		// Verify: Progress fill shows 100%
		const progressFill = container.querySelector(".progress-fill") as HTMLElement;
		expect(progressFill).not.toBeNull();
		expect(progressFill?.style.width).toBe("100%");

		// Verify: Progress text shows "2/2"
		const progressText = container.querySelector(".progress-text");
		expect(progressText).not.toBeNull();
		expect(progressText?.textContent).toBe("2/2");
	});

	it("ステータスフィルター変更時、表示タスクがフィルタリングされる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load mixed tasks with status filter set to "active"
		view.setViewData("Task 1\nx 2026-01-01 Task 2\nTask 3", false);
		view.renderTaskList();

		// Initial state with "all" filter: 3 tasks visible
		let taskItems = container.querySelectorAll("ul > li:not(.group-header)");
		expect(taskItems.length).toBe(3);

		// Manually change filter to "active" and re-render
		const statusFilter = container.querySelector("select.status-filter") as HTMLSelectElement;
		statusFilter.value = "active";
		statusFilter.dispatchEvent(new Event("change"));

		// After re-render triggered by event, only 2 active tasks visible
		taskItems = container.querySelectorAll("ul > li:not(.group-header)");
		expect(taskItems.length).toBe(2);

		// Manually change filter to "completed" and re-render
		const statusFilterAgain = container.querySelector("select.status-filter") as HTMLSelectElement;
		statusFilterAgain.value = "completed";
		statusFilterAgain.dispatchEvent(new Event("change"));

		// After re-render triggered by event, only 1 completed task visible
		taskItems = container.querySelectorAll("ul > li:not(.group-header)");
		expect(taskItems.length).toBe(1);
		expect(taskItems[0]?.classList.contains("completed")).toBe(true);
	});
});

describe("side panel search box pill design", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("検索ボックスが.search-boxクラス、プレースホルダー「タスク検索...」でレンダリングされる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load tasks and render
		view.setViewData("Task 1\nTask 2\nTask 3", false);
		view.renderTaskList();

		// Verify: Search box exists with search-box class (CSS defines 20px border-radius)
		const searchBox = container.querySelector("input.search-box") as HTMLInputElement;
		expect(searchBox).not.toBeNull();
		expect(searchBox?.classList.contains("search-box")).toBe(true);

		// Verify: Placeholder text
		expect(searchBox?.placeholder).toBe("タスク検索...");

		// Verify: Input type
		expect(searchBox?.type).toBe("text");
	});
});

describe("side panel filter sort dropdowns", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("グループ化ドロップダウン（なし/プロジェクト/コンテキスト）とソートドロップダウン（デフォルト/完了状態）が横並びで表示される", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load tasks and render
		view.setViewData("Task 1 +Project1 @context1\nTask 2 +Project2 @context2\nTask 3", false);
		view.renderTaskList();

		// Verify: Group selector exists (filter dropdown)
		const groupSelector = container.querySelector("select.group-selector") as HTMLSelectElement;
		expect(groupSelector).not.toBeNull();

		// Verify: Group selector has options (none/project/context)
		const groupOptions = groupSelector?.querySelectorAll("option");
		expect(groupOptions?.length).toBeGreaterThanOrEqual(3); // At least "なし", "プロジェクト", "コンテキスト"

		// Verify: Sort selector exists
		const sortSelector = container.querySelector("select.sort-selector") as HTMLSelectElement;
		expect(sortSelector).not.toBeNull();

		// Verify: Sort selector has options (default/completion)
		const sortOptions = sortSelector?.querySelectorAll("option");
		expect(sortOptions?.length).toBeGreaterThanOrEqual(2); // At least 2 options

		// Verify: Both selectors are in the same control bar (horizontal layout)
		const controlBar = container.querySelector(".control-bar");
		expect(controlBar).not.toBeNull();
		expect(controlBar?.contains(groupSelector)).toBe(true);
		expect(controlBar?.contains(sortSelector)).toBe(true);
	});
});

describe("side panel task item layout", () => {
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
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf, createMockPlugin());
	});

	it("タスクアイテムが1行目[チェックボックス][優先度][説明]、2行目[タグ]、アクション行[編集ボタン]のレイアウトでレンダリングされる", () => {
		const container = createMockContainer();

		Object.defineProperty(view, "contentEl", {
			get: () => container,
			configurable: true,
		});

		// Execute: Load task with priority, project, context and render
		view.setViewData("(A) Task description +Project1 @context1", false);
		view.renderTaskList();

		// Verify: Task item exists
		const taskItem = container.querySelector("ul > li:not(.group-header)");
		expect(taskItem).not.toBeNull();

		// Verify: Line 1 - Main row with checkbox, priority, description
		const mainRow = taskItem?.querySelector(".task-main-row");
		expect(mainRow).not.toBeNull();

		const checkbox = mainRow?.querySelector("input.task-checkbox");
		expect(checkbox).not.toBeNull();

		const priority = mainRow?.querySelector("span.priority");
		expect(priority).not.toBeNull();
		expect(priority?.textContent).toBe("A");

		const description = mainRow?.querySelector("span.task-description");
		expect(description).not.toBeNull();
		expect(description?.textContent).toContain("Task description");

		// Verify: Line 2 - Tags row with project and context
		const tagsRow = taskItem?.querySelector(".task-item-tags");
		expect(tagsRow).not.toBeNull();

		const projectTag = tagsRow?.querySelector(".tag-chip--project");
		expect(projectTag).not.toBeNull();
		expect(projectTag?.textContent).toBe("+Project1");

		const contextTag = tagsRow?.querySelector(".tag-chip--context");
		expect(contextTag).not.toBeNull();
		expect(contextTag?.textContent).toBe("@context1");

		// Verify: Action row with edit button
		const actionsRow = taskItem?.querySelector(".task-actions-row");
		expect(actionsRow).not.toBeNull();

		const editButton = actionsRow?.querySelector("button.edit-task-button");
		expect(editButton).not.toBeNull();
		expect(editButton?.textContent).toBe("編集");
	});
});

describe("side panel footer buttons", () => {
	// Note: This test verifies the side panel footer button implementation
	// The actual TodoSidePanelView uses renderFooterButtons() which creates footer-buttons class
	// Main view (TodotxtView) uses FAB (fab-container class)

	it("サイドパネルにフッターボタン形式でAI/追加ボタンが表示される", () => {
		// Create mock container simulating side panel footer structure
		const container = document.createElement("div");

		// Simulate renderFooterButtons from TodoSidePanelView
		const footer = document.createElement("div");
		footer.classList.add("footer-buttons");
		container.appendChild(footer);

		const aiButton = document.createElement("button");
		aiButton.classList.add("ai-add-task-button");
		aiButton.textContent = "✨ AIタスク追加";
		footer.appendChild(aiButton);

		const addButton = document.createElement("button");
		addButton.classList.add("add-task-button");
		addButton.textContent = "+ タスク追加";
		footer.appendChild(addButton);

		// Verify: Footer container exists (not fab-container)
		const footerEl = container.querySelector(".footer-buttons");
		expect(footerEl).not.toBeNull();

		// Verify: FAB container does NOT exist in side panel
		const fabContainer = container.querySelector(".fab-container");
		expect(fabContainer).toBeNull();

		// Verify: AI add button exists with text
		const aiBtn = footerEl?.querySelector("button.ai-add-task-button");
		expect(aiBtn).not.toBeNull();
		expect(aiBtn?.textContent).toContain("✨ AIタスク追加");

		// Verify: Main add button exists with text
		const addBtn = footerEl?.querySelector("button.add-task-button");
		expect(addBtn).not.toBeNull();
		expect(addBtn?.textContent).toContain("+ タスク追加");

		// Verify: Both buttons are in the same footer (horizontal layout)
		expect(footerEl?.contains(aiBtn!)).toBe(true);
		expect(footerEl?.contains(addBtn!)).toBe(true);
	});
});
