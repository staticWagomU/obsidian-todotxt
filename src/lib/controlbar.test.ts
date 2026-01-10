import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TodotxtView } from "../view";

// Mock Obsidian modules
vi.mock("obsidian", () => {
	// Helper to add Obsidian-like createEl method to elements recursively
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

describe("priority filter dropdown", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("優先度フィルタドロップダウンが表示される", () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2\nTask 3", false);

		// Verify: Priority filter dropdown exists
		const dropdown = view.contentEl.querySelector("select.priority-filter");
		expect(dropdown).not.toBeNull();
	});

	it("優先度フィルタドロップダウンに「全て」「A」「B」「C」「優先度なし」オプションが含まれる", () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2\nTask 3", false);

		// Verify: Dropdown has expected options
		const dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		expect(dropdown).not.toBeNull();

		const options = Array.from(dropdown.options).map(opt => opt.value);
		expect(options).toContain("all");
		expect(options).toContain("A");
		expect(options).toContain("B");
		expect(options).toContain("C");
		expect(options).toContain("none");
	});

	it("優先度Aを選択すると優先度Aのタスクのみ表示される", () => {
		// Setup: Multiple tasks with different priorities
		view.setViewData("(A) Task 1\n(B) Task 2\n(C) Task 3\nTask 4", false);

		// Execute: Select priority A
		const dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		dropdown.value = "A";
		dropdown.dispatchEvent(new Event("change"));

		// Verify: Only priority A task is visible
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(1);
		expect(liElements[0]?.textContent).toContain("Task 1");
	});

	it("優先度なしを選択すると優先度なしのタスクのみ表示される", () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2\nTask 3\nTask 4", false);

		// Execute: Select "none" priority
		const dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		dropdown.value = "none";
		dropdown.dispatchEvent(new Event("change"));

		// Verify: Only tasks without priority are visible
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(2);
		expect(liElements[0]?.textContent).toContain("Task 3");
		expect(liElements[1]?.textContent).toContain("Task 4");
	});

	it("「全て」を選択すると全てのタスクが表示される", () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2\nTask 3", false);

		// First filter by A
		let dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		dropdown.value = "A";
		dropdown.dispatchEvent(new Event("change"));

		// Then select "all" (need to re-query after change event)
		dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		dropdown.value = "all";
		dropdown.dispatchEvent(new Event("change"));

		// Verify: All tasks are visible
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(3);
	});

	it("優先度フィルタ適用後もタスク追加・削除が正常に動作する", async () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2", false);

		// Filter by priority A
		const dropdown = view.contentEl.querySelector("select.priority-filter") as HTMLSelectElement;
		dropdown.value = "A";
		dropdown.dispatchEvent(new Event("change"));

		// Verify: Only 1 task visible
		let ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(1);

		// Add new task with priority A
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Task 3", "A");

		vi.useRealTimers();

		// Verify: 2 tasks visible (filter still applied)
		ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(2);
	});
});

describe("text search box", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("テキスト検索ボックスが表示される", () => {
		// Setup
		view.setViewData("Task 1\nTask 2\nTask 3", false);

		// Verify: Search box exists
		const searchBox = view.contentEl.querySelector("input.search-box");
		expect(searchBox).not.toBeNull();
		expect((searchBox as HTMLInputElement).type).toBe("text");
	});

	it("検索ボックスに「milk」と入力すると「Buy milk」のみ表示される", () => {
		// Setup
		view.setViewData("Buy milk\nCall Mom\nWrite report", false);

		// Execute: Type in search box
		const searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "milk";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: Only matching task is visible
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(1);
		expect(liElements[0]?.textContent).toContain("Buy milk");
	});

	it("検索ボックスに「work」と入力すると「+Work」プロジェクトを含むタスクが表示される", () => {
		// Setup
		view.setViewData("Buy milk\nWrite report +Work\nCall Mom +Personal", false);

		// Execute: Search for project
		const searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "work";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: Task with +Work is visible
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(1);
		expect(liElements[0]?.textContent).toContain("Write report");
	});

	it("検索ボックスを空にすると全てのタスクが表示される", () => {
		// Setup
		view.setViewData("Task 1\nTask 2\nTask 3", false);

		// First, filter
		let searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "Task 1";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: Only 1 task visible
		let ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(1);

		// Clear search (need to re-query after input event)
		searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: All tasks visible
		ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(3);
	});

	it("検索適用後もタスク追加・削除が正常に動作する", async () => {
		// Setup
		view.setViewData("Buy milk\nCall Mom", false);

		// Apply search filter
		const searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "milk";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: Only 1 task visible
		let ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(1);

		// Add new task with "milk" in description
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-10"));

		const handleAdd = view.getAddHandler();
		await handleAdd("Drink milk", "A");

		vi.useRealTimers();

		// Verify: 2 tasks visible (filter still applied)
		ul = view.contentEl.querySelector("ul");
		expect(ul?.children.length).toBe(2);
	});

	it("大文字小文字を区別せずに検索できる", () => {
		// Setup
		view.setViewData("Buy MILK\nCall Mom\nWrite REPORT", false);

		// Execute: Search with lowercase
		const searchBox = view.contentEl.querySelector("input.search-box") as HTMLInputElement;
		searchBox.value = "milk";
		searchBox.dispatchEvent(new Event("input"));

		// Verify: Task with "MILK" is found
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		expect(liElements.length).toBe(1);
		expect(liElements[0]?.textContent).toContain("MILK");
	});
});

describe("group selector", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("グループ化セレクタが表示される", () => {
		// Setup
		view.setViewData("Task 1 +Work\nTask 2 @home", false);

		// Verify: Group selector exists
		const groupSelector = view.contentEl.querySelector("select.group-selector");
		expect(groupSelector).not.toBeNull();
	});

	it("グループ化セレクタに「なし」「プロジェクト」「コンテキスト」「優先度」オプションが含まれる", () => {
		// Setup
		view.setViewData("Task 1", false);

		// Verify: Selector has expected options
		const groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		expect(groupSelector).not.toBeNull();

		const options = Array.from(groupSelector.options).map(opt => opt.value);
		expect(options).toContain("none");
		expect(options).toContain("project");
		expect(options).toContain("context");
		expect(options).toContain("priority");
	});

	it("プロジェクト別グループ化を選択するとプロジェクトごとにグループ表示される", () => {
		// Setup
		view.setViewData("Task 1 +Work\nTask 2 +Personal\nTask 3 +Work", false);

		// Execute: Select group by project
		const groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		groupSelector.value = "project";
		groupSelector.dispatchEvent(new Event("change"));

		// Verify: Tasks are grouped by project
		const ul = view.contentEl.querySelector("ul");
		const groupHeaders = ul?.querySelectorAll("li.group-header");

		expect(groupHeaders?.length).toBeGreaterThan(0);
		// Verify group structure exists
		expect(ul?.textContent).toContain("Work");
		expect(ul?.textContent).toContain("Personal");
	});

	it("コンテキスト別グループ化を選択するとコンテキストごとにグループ表示される", () => {
		// Setup
		view.setViewData("Task 1 @home\nTask 2 @office\nTask 3 @home", false);

		// Execute: Select group by context
		const groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		groupSelector.value = "context";
		groupSelector.dispatchEvent(new Event("change"));

		// Verify: Tasks are grouped by context
		const ul = view.contentEl.querySelector("ul");
		expect(ul?.textContent).toContain("home");
		expect(ul?.textContent).toContain("office");
	});

	it("優先度別グループ化を選択すると優先度ごとにグループ表示される", () => {
		// Setup
		view.setViewData("(A) Task 1\n(B) Task 2\n(A) Task 3\nTask 4", false);

		// Execute: Select group by priority
		const groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		groupSelector.value = "priority";
		groupSelector.dispatchEvent(new Event("change"));

		// Verify: Tasks are grouped by priority
		const ul = view.contentEl.querySelector("ul");
		const groupHeaders = ul?.querySelectorAll("li.group-header");

		expect(groupHeaders?.length).toBeGreaterThan(0);
	});

	it("「なし」を選択するとグループ化が解除される", () => {
		// Setup
		view.setViewData("Task 1 +Work\nTask 2 +Personal", false);

		// First, group by project
		let groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		groupSelector.value = "project";
		groupSelector.dispatchEvent(new Event("change"));

		// Then select "none"
		groupSelector = view.contentEl.querySelector("select.group-selector") as HTMLSelectElement;
		groupSelector.value = "none";
		groupSelector.dispatchEvent(new Event("change"));

		// Verify: No group headers
		const ul = view.contentEl.querySelector("ul");
		const groupHeaders = ul?.querySelectorAll("li.group-header");
		expect(groupHeaders?.length).toBe(0);
	});
});

describe("sort selector", () => {
	let view: TodotxtView;
	let mockLeaf: { view: null };

	beforeEach(() => {
		mockLeaf = {
			view: null,
		};
		view = new TodotxtView(mockLeaf as unknown as WorkspaceLeaf);
	});

	it("ソートセレクタが表示される", () => {
		// Setup
		view.setViewData("Task 1\nTask 2", false);

		// Verify: Sort selector exists
		const sortSelector = view.contentEl.querySelector("select.sort-selector");
		expect(sortSelector).not.toBeNull();
	});

	it("ソートセレクタに「デフォルト」「未完了→完了」オプションが含まれる", () => {
		// Setup
		view.setViewData("Task 1", false);

		// Verify: Selector has expected options
		const sortSelector = view.contentEl.querySelector("select.sort-selector") as HTMLSelectElement;
		expect(sortSelector).not.toBeNull();

		const options = Array.from(sortSelector.options).map(opt => opt.value);
		expect(options).toContain("default");
		expect(options).toContain("completion");
	});

	it("未完了→完了ソートを選択すると未完了タスクが完了タスクより先に表示される", () => {
		// Setup: Mix of completed and incomplete tasks
		view.setViewData("x 2026-01-01 Task 1\nTask 2\nx 2026-01-02 Task 3\nTask 4", false);

		// Execute: Select sort by completion
		const sortSelector = view.contentEl.querySelector("select.sort-selector") as HTMLSelectElement;
		sortSelector.value = "completion";
		sortSelector.dispatchEvent(new Event("change"));

		// Verify: Incomplete tasks come first
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		// First two should be incomplete
		expect(liElements[0]?.classList.contains("completed")).toBe(false);
		expect(liElements[1]?.classList.contains("completed")).toBe(false);
		// Last two should be completed
		expect(liElements[2]?.classList.contains("completed")).toBe(true);
		expect(liElements[3]?.classList.contains("completed")).toBe(true);
	});

	it("「デフォルト」を選択するとソートが解除される", () => {
		// Setup
		view.setViewData("x Task 1\nTask 2\nx Task 3", false);

		// First, sort by completion
		let sortSelector = view.contentEl.querySelector("select.sort-selector") as HTMLSelectElement;
		sortSelector.value = "completion";
		sortSelector.dispatchEvent(new Event("change"));

		// Then select "default"
		sortSelector = view.contentEl.querySelector("select.sort-selector") as HTMLSelectElement;
		sortSelector.value = "default";
		sortSelector.dispatchEvent(new Event("change"));

		// Verify: Original order maintained
		const ul = view.contentEl.querySelector("ul");
		const liElements = Array.from(ul?.children || []) as HTMLLIElement[];

		// First task should be completed (original order)
		expect(liElements[0]?.classList.contains("completed")).toBe(true);
	});
});
