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
		(el as any).createEl = (childTag: string) => {
			const childEl = document.createElement(childTag);
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
});
