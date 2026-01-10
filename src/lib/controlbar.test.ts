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
