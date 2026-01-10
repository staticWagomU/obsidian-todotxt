/**
 * BaseTaskModal - プレビュー機能のテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseTaskModal } from "./BaseTaskModal";
import type { App } from "obsidian";
import type { Todo } from "../lib/todo";

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

// テスト用の具象クラス
class TestTaskModal extends BaseTaskModal {
	onOpen(): void {
		// テスト用に空実装
	}

	onClose(): void {
		// テスト用に空実装
	}
}

describe("BaseTaskModal - Preview", () => {
	let mockApp: App;
	let modal: TestTaskModal;

	beforeEach(() => {
		mockApp = {} as App;
		modal = new TestTaskModal(mockApp);
	});

	describe("createPreviewArea", () => {
		it("プレビューエリアのDOM要素を生成する", () => {
			const container = document.createElement("div");

			modal.createPreviewArea(container);

			// ラベルが作成されている
			const label = container.querySelector("label");
			expect(label).toBeTruthy();
			expect(label?.textContent).toBe("プレビュー");

			// pre要素が作成されている
			const pre = container.querySelector("pre.preview-area");
			expect(pre).toBeTruthy();
		});
	});

	describe("updatePreview", () => {
		it("serializeTodoの結果をプレビューエリアに反映する", () => {
			const container = document.createElement("div");
			const previewEl = document.createElement("pre");
			previewEl.classList.add("preview-area");
			container.appendChild(previewEl);

			const todo: Todo = {
				completed: false,
				priority: "A",
				creationDate: "2026-01-11",
				description: "Test task +project @context due:2026-01-15",
				projects: ["project"],
				contexts: ["context"],
				tags: { due: "2026-01-15" },
				raw: "",
			};

			modal.updatePreview(container, todo);

			const pre = container.querySelector("pre.preview-area");
			expect(pre?.textContent).toBe("(A) 2026-01-11 Test task +project @context due:2026-01-15");
		});
	});
});
