/**
 * AddTaskModal - タスク追加モーダルテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddTaskModal } from "./AddTaskModal";
import type { App } from "obsidian";

// Mock Obsidian Modal
vi.mock("obsidian", () => {
	return {
		Modal: class {
			app: unknown;
			contentEl: HTMLElement;

			constructor(app: unknown) {
				this.app = app;
				this.contentEl = document.createElement("div");
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
});
