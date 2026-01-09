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

describe("render task list in view", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	// Helper type for mock container
	type MockContainer = HTMLElement & {
		empty: () => void;
		createEl: (tag: string) => HTMLElement;
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
});
