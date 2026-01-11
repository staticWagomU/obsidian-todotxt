/**
 * AddTaskModal - タスク追加モーダルテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddTaskModal } from "./AddTaskModal";
import type { App } from "obsidian";

// Mock Obsidian Modal with createEl method
vi.mock("obsidian", () => {
	// Helper function to add Obsidian-like createEl method to elements
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const addCreateElMethod = (el: HTMLElement): any => {
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
	};

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
			onOpen(): void {}
			onClose(): void {}
		},
	};
});

describe("AddTaskModal", () => {
	let mockApp: App;
	let mockOnSave: (
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	) => void;

	beforeEach(() => {
		mockApp = {} as App;
		mockOnSave = vi.fn();
	});

	it("AddTaskModal classが存在しModalを継承すること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);

		expect(modal).toBeDefined();
		expect(modal).toBeInstanceOf(AddTaskModal);
		// Modal methods should exist
		expect(typeof modal.open).toBe("function");
		expect(typeof modal.close).toBe("function");
	});

	it("onSaveコールバックを保持すること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);

		// Modal should store the onSave callback
		expect(modal.onSave).toBe(mockOnSave);
	});

	it("モーダルにタスク説明入力フィールドが存在すること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);

		// Call onOpen to render the modal content
		modal.onOpen();

		// Verify: input field for task description exists
		const input = modal.contentEl.querySelector("input.task-description-input");
		expect(input).not.toBeNull();
		expect(input?.getAttribute("type")).toBe("text");
		expect(input?.getAttribute("placeholder")).toContain("タスク");
	});

	it("モーダルに保存ボタンが存在しクリックでonSaveが呼ばれること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Verify: Save button exists
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		expect(saveButton).not.toBeNull();
		expect(saveButton?.textContent).toContain("保存");

		// Enter task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "新しいタスク";

		// Click save button
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with the input value
		expect(mockOnSave).toHaveBeenCalledWith("新しいタスク", undefined, undefined, undefined);
	});

	it("優先度ドロップダウン（なし/A-Z）が表示されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
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

	it("選択した優先度がonSaveに渡されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Enter task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度テスト";

		// Select priority
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "A";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with priority
		expect(mockOnSave).toHaveBeenCalledWith("優先度テスト", "A", undefined, undefined);
	});

	it("優先度「なし」を選択した場合はundefinedがonSaveに渡されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Enter task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度なしタスク";

		// Select "なし" (value="")
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with undefined
		expect(mockOnSave).toHaveBeenCalledWith("優先度なしタスク", undefined, undefined, undefined);
	});

	it("due:日付入力フィールドが表示されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Verify: due date input exists
		const dueInput = modal.contentEl.querySelector("input.due-date-input");
		expect(dueInput).not.toBeNull();
		expect(dueInput?.getAttribute("type")).toBe("date");
	});

	it("t:日付入力フィールドが表示されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Verify: threshold date input exists
		const thresholdInput = modal.contentEl.querySelector("input.threshold-date-input");
		expect(thresholdInput).not.toBeNull();
		expect(thresholdInput?.getAttribute("type")).toBe("date");
	});

	it("due:日付を選択した場合onSaveに渡されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Enter task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "期限付きタスク";

		// Select due date
		const dueInput = modal.contentEl.querySelector("input.due-date-input") as HTMLInputElement;
		dueInput.value = "2026-01-15";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with due date
		expect(mockOnSave).toHaveBeenCalledWith("期限付きタスク", undefined, "2026-01-15", undefined);
	});

	it("t:日付を選択した場合onSaveに渡されること", () => {
		const modal = new AddTaskModal(mockApp, mockOnSave);
		modal.onOpen();

		// Enter task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "しきい値付きタスク";

		// Select threshold date
		const thresholdInput = modal.contentEl.querySelector("input.threshold-date-input") as HTMLInputElement;
		thresholdInput.value = "2026-01-20";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with threshold date
		expect(mockOnSave).toHaveBeenCalledWith("しきい値付きタスク", undefined, undefined, "2026-01-20");
	});

	it("既存プロジェクト一覧がチップUIで表示されること", () => {
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

		const modal = new AddTaskModal(mockApp, mockOnSave, mockTodos);
		modal.onOpen();

		// Verify: Project chip input container exists
		const tagChips = modal.contentEl.querySelectorAll(".tag-chips");
		expect(tagChips.length).toBeGreaterThanOrEqual(1);

		// Verify: Project suggestions exist (フォーカス時に表示される候補)
		const projectSuggestions = modal.contentEl.querySelector(".tag-suggestions");
		expect(projectSuggestions).not.toBeNull();

		// Verify: Inline input for adding new projects
		const projectInput = modal.contentEl.querySelector(".tag-input--inline");
		expect(projectInput).not.toBeNull();
	});

	it("既存コンテキスト一覧がチップUIで表示されること", () => {
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

		const modal = new AddTaskModal(mockApp, mockOnSave, mockTodos);
		modal.onOpen();

		// Verify: Context chip input container exists (2つ目がコンテキスト用)
		const tagChips = modal.contentEl.querySelectorAll(".tag-chips");
		expect(tagChips.length).toBe(2); // プロジェクトとコンテキストの2つ

		// Verify: Context suggestions exist
		const contextSuggestions = modal.contentEl.querySelectorAll(".tag-suggestions");
		expect(contextSuggestions.length).toBe(2);
	});

	it("プロジェクト/コンテキストが存在しない場合、空のチップUIが表示されること", () => {
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

		const modal = new AddTaskModal(mockApp, mockOnSave, mockTodos);
		modal.onOpen();

		// Verify: Chip containers exist even without suggestions
		const tagChips = modal.contentEl.querySelectorAll(".tag-chips");
		expect(tagChips.length).toBe(2); // プロジェクトとコンテキストの2つ

		// Verify: No pre-selected chips
		const selectedChips = modal.contentEl.querySelectorAll(".tag-chip");
		expect(selectedChips.length).toBe(0);
	});

	describe("プレビュー機能", () => {
		it("フォーム下部にプレビューエリアが表示されること", () => {
			const modal = new AddTaskModal(mockApp, mockOnSave);
			modal.onOpen();

			// Verify: Preview label exists
			const labels = Array.from(modal.contentEl.querySelectorAll("label"));
			const previewLabel = labels.find((label) => label.textContent === "プレビュー");
			expect(previewLabel).not.toBeNull();

			// Verify: Preview area exists
			const previewArea = modal.contentEl.querySelector("pre.preview-area");
			expect(previewArea).not.toBeNull();
		});

		it("入力変更時にリアルタイムでプレビューが更新されること", () => {
			const modal = new AddTaskModal(mockApp, mockOnSave);
			modal.onOpen();

			const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
			const prioritySelect = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
			const previewArea = modal.contentEl.querySelector("pre.preview-area");

			// Enter task description
			input.value = "Test task";
			input.dispatchEvent(new Event("input"));

			// Verify: Preview updated
			expect(previewArea?.textContent).toContain("Test task");

			// Select priority
			prioritySelect.value = "A";
			prioritySelect.dispatchEvent(new Event("change"));

			// Verify: Preview shows priority
			expect(previewArea?.textContent).toContain("(A)");
		});

		it("プレビューがtodo.txt形式に準拠していること", () => {
			const modal = new AddTaskModal(mockApp, mockOnSave);
			modal.onOpen();

			const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
			const prioritySelect = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
			const dueDateInput = modal.contentEl.querySelector("input.due-date-input") as HTMLInputElement;
			const previewArea = modal.contentEl.querySelector("pre.preview-area");

			// Set values
			prioritySelect.value = "A";
			prioritySelect.dispatchEvent(new Event("change"));
			input.value = "Important task";
			input.dispatchEvent(new Event("input"));
			dueDateInput.value = "2026-01-15";
			dueDateInput.dispatchEvent(new Event("change"));

			// Verify: todo.txt format
			const previewText = previewArea?.textContent || "";
			expect(previewText).toMatch(/^\(A\) \d{4}-\d{2}-\d{2} Important task due:2026-01-15$/);
		});
	});
});
