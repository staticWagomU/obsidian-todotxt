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
	let mockOnSave: (description: string, priority?: string) => void;

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
		expect(mockOnSave).toHaveBeenCalledWith("新しいタスク", undefined);
	});
});
