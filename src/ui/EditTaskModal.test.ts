import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditTaskModal } from "./EditTaskModal";
import type { App } from "obsidian";

// Mock Obsidian Modal
vi.mock("obsidian", () => {
	// Helper to add Obsidian-like createEl method to elements recursively
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function addCreateElMethod(el: HTMLElement): any {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
		(el as any).createEl = (childTag: string, options?: { cls?: string }) => {
			const childEl = document.createElement(childTag);
			if (options?.cls) {
				childEl.className = options.cls;
			}
			el.appendChild(childEl);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return addCreateElMethod(childEl);
		};
		return el;
	}

	return {
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

describe("EditTaskModal", () => {
	let modal: EditTaskModal;
	let mockApp: App;
	let onSaveSpy: (
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	) => void;

	beforeEach(() => {
		mockApp = {} as App;
		onSaveSpy = vi.fn();
		modal = new EditTaskModal(mockApp, "Buy milk", onSaveSpy);
	});

	it("モーダルを開くとタスク説明入力フィールドが表示される", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		expect(input).not.toBeNull();
		expect(input.type).toBe("text");
	});

	it("入力フィールドに既存のタスク説明が初期値として設定される", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		expect(input.value).toBe("Buy milk");
	});

	it("保存ボタンが表示される", () => {
		modal.onOpen();

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		expect(saveButton).not.toBeNull();
		expect(saveButton?.textContent).toBe("保存");
	});

	it("保存ボタンをクリックするとonSaveコールバックが呼ばれる", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "Buy bread";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).toHaveBeenCalledWith("Buy bread", undefined, undefined, undefined);
	});

	it("空の入力で保存ボタンをクリックしてもonSaveが呼ばれない", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).not.toHaveBeenCalled();
	});

	it("空白のみの入力で保存ボタンをクリックしてもonSaveが呼ばれない", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "   ";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).not.toHaveBeenCalled();
	});

	it("モーダルを閉じるとコンテンツがクリアされる", () => {
		modal.onOpen();
		modal.onClose();

		expect(modal.contentEl.innerHTML).toBe("");
	});

	it("優先度ドロップダウン（なし/A-Z）が表示されること", () => {
		modal.onOpen();

		// Verify: Priority select exists
		const select = modal.contentEl.querySelector("select.priority-select");
		expect(select).not.toBeNull();

		// Verify: First option is "なし" (null value)
		const options = Array.from(select?.querySelectorAll("option") || []);
		expect(options.length).toBe(27); // なし + A-Z (26)
		expect(options[0]?.textContent).toBe("なし");
		expect((options[0] as HTMLOptionElement)?.value).toBe("");

		// Verify: A-Z options exist
		expect(options[1]?.textContent).toBe("(A)");
		expect((options[1] as HTMLOptionElement)?.value).toBe("A");
		expect(options[26]?.textContent).toBe("(Z)");
		expect((options[26] as HTMLOptionElement)?.value).toBe("Z");
	});

	it("既存の優先度が選択状態で表示されること", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		const modalWithPriority = new EditTaskModal(mockApp as any, "Buy milk", onSaveSpy as any, "B");
		modalWithPriority.onOpen();

		const select = modalWithPriority.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		expect(select.value).toBe("B");
	});

	it("優先度なしタスクの場合は「なし」が選択されること", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		const modalNoPriority = new EditTaskModal(mockApp as any, "Buy milk", onSaveSpy as any, undefined);
		modalNoPriority.onOpen();

		const select = modalNoPriority.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		expect(select.value).toBe("");
	});

	it("選択した優先度がonSaveに渡されること", () => {
		modal.onOpen();

		// Set task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度テスト";

		// Select priority
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "A";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with priority
		expect(onSaveSpy).toHaveBeenCalledWith("優先度テスト", "A", undefined, undefined);
	});

	it("優先度「なし」を選択した場合はundefinedがonSaveに渡されること", () => {
		modal.onOpen();

		// Set task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度なしタスク";

		// Select "なし" (value="")
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with undefined
		expect(onSaveSpy).toHaveBeenCalledWith("優先度なしタスク", undefined, undefined, undefined);
	});

	it("due:日付入力フィールドが表示されること", () => {
		modal.onOpen();

		const dueInput = modal.contentEl.querySelector("input.due-date-input");
		expect(dueInput).not.toBeNull();
		expect(dueInput?.getAttribute("type")).toBe("date");
	});

	it("t:日付入力フィールドが表示されること", () => {
		modal.onOpen();

		const thresholdInput = modal.contentEl.querySelector("input.threshold-date-input");
		expect(thresholdInput).not.toBeNull();
		expect(thresholdInput?.getAttribute("type")).toBe("date");
	});

	it("既存due:タグが日付入力フィールドに初期値として表示されること", () => {
		const modalWithDue = new EditTaskModal(
			mockApp,
			"Buy milk",
			onSaveSpy,
			undefined,
			"2026-01-15",
			undefined,
		);
		modalWithDue.onOpen();

		const dueInput = modalWithDue.contentEl.querySelector("input.due-date-input") as HTMLInputElement;
		expect(dueInput.value).toBe("2026-01-15");
	});

	it("既存t:タグが日付入力フィールドに初期値として表示されること", () => {
		const modalWithThreshold = new EditTaskModal(
			mockApp,
			"Buy milk",
			onSaveSpy,
			undefined,
			undefined,
			"2026-01-20",
		);
		modalWithThreshold.onOpen();

		const thresholdInput = modalWithThreshold.contentEl.querySelector("input.threshold-date-input") as HTMLInputElement;
		expect(thresholdInput.value).toBe("2026-01-20");
	});

	it("日付を変更した場合onSaveに渡されること", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "期限変更テスト";

		const dueInput = modal.contentEl.querySelector("input.due-date-input") as HTMLInputElement;
		dueInput.value = "2026-02-01";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).toHaveBeenCalledWith("期限変更テスト", undefined, "2026-02-01", undefined);
	});

	it("既存プロジェクト一覧がマルチセレクトで表示されること", () => {
		const mockTodos = [
			{
				completed: false,
				description: "Task 1 +project1 +project2",
				projects: ["project1", "project2"],
				contexts: [],
				tags: {},
				raw: "",
			},
			{
				completed: false,
				description: "Task 2 +project3",
				projects: ["project3"],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const modalWithTodos = new EditTaskModal(
			mockApp,
			"Buy milk",
			onSaveSpy,
			undefined,
			undefined,
			undefined,
			mockTodos,
		);
		modalWithTodos.onOpen();

		// Verify: Project multi-select exists
		const projectSelect = modalWithTodos.contentEl.querySelector("select.project-select") as HTMLSelectElement;
		expect(projectSelect).not.toBeNull();
		expect(projectSelect.multiple).toBe(true);

		// Verify: Options are sorted and unique
		const options = Array.from(projectSelect.querySelectorAll("option"));
		expect(options.length).toBe(3);
		expect(options[0]?.textContent).toBe("+project1");
		expect(options[1]?.textContent).toBe("+project2");
		expect(options[2]?.textContent).toBe("+project3");
	});

	it("既存コンテキスト一覧がマルチセレクトで表示されること", () => {
		const mockTodos = [
			{
				completed: false,
				description: "Task 1 @home @work",
				projects: [],
				contexts: ["home", "work"],
				tags: {},
				raw: "",
			},
			{
				completed: false,
				description: "Task 2 @email",
				projects: [],
				contexts: ["email"],
				tags: {},
				raw: "",
			},
		];

		const modalWithTodos = new EditTaskModal(
			mockApp,
			"Buy milk",
			onSaveSpy,
			undefined,
			undefined,
			undefined,
			mockTodos,
		);
		modalWithTodos.onOpen();

		// Verify: Context multi-select exists
		const contextSelect = modalWithTodos.contentEl.querySelector("select.context-select") as HTMLSelectElement;
		expect(contextSelect).not.toBeNull();
		expect(contextSelect.multiple).toBe(true);

		// Verify: Options are sorted and unique
		const options = Array.from(contextSelect.querySelectorAll("option"));
		expect(options.length).toBe(3);
		expect(options[0]?.textContent).toBe("@email");
		expect(options[1]?.textContent).toBe("@home");
		expect(options[2]?.textContent).toBe("@work");
	});

	it("プロジェクト/コンテキストが存在しない場合、空のマルチセレクトが表示されること", () => {
		const mockTodos = [
			{
				completed: false,
				description: "Task without tags",
				projects: [],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const modalWithTodos = new EditTaskModal(
			mockApp,
			"Buy milk",
			onSaveSpy,
			undefined,
			undefined,
			undefined,
			mockTodos,
		);
		modalWithTodos.onOpen();

		// Verify: Empty project select
		const projectSelect = modalWithTodos.contentEl.querySelector("select.project-select") as HTMLSelectElement;
		expect(projectSelect).not.toBeNull();
		const projectOptions = Array.from(projectSelect.querySelectorAll("option"));
		expect(projectOptions.length).toBe(0);

		// Verify: Empty context select
		const contextSelect = modalWithTodos.contentEl.querySelector("select.context-select") as HTMLSelectElement;
		expect(contextSelect).not.toBeNull();
		const contextOptions = Array.from(contextSelect.querySelectorAll("option"));
		expect(contextOptions.length).toBe(0);
	});
});
