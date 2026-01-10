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

	// テスト用にprotectedメソッドをpublicで公開
	public testCreatePreviewArea(container: HTMLElement): void {
		this.createPreviewArea(container);
	}

	public testUpdatePreview(container: HTMLElement, todo: Todo): void {
		this.updatePreview(container, todo);
	}

	public testCreateToggleButton(container: HTMLElement): void {
		this.createToggleButton(container);
	}

	public getIsTextMode(): boolean {
		return this.isTextMode;
	}

	public testCreateTextModeArea(container: HTMLElement): void {
		this.createTextModeArea(container);
	}

	public testUpdateTextModeVisibility(container: HTMLElement): void {
		this.updateTextModeVisibility(container);
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
			// contentElを使用（createElメソッドを持つ）
			const container = modal.contentEl;

			modal.testCreatePreviewArea(container);

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

			modal.testUpdatePreview(container, todo);

			const pre = container.querySelector("pre.preview-area");
			expect(pre?.textContent).toBe("(A) 2026-01-11 Test task +project @context due:2026-01-15");
		});
	});

	describe("createToggleButton", () => {
		it("モード切替ボタンが作成される", () => {
			const container = modal.contentEl;

			modal.testCreateToggleButton(container);

			// ボタンが作成されている
			const button = container.querySelector("button.mode-toggle-button");
			expect(button).toBeTruthy();
			expect(button?.getAttribute("aria-label")).toBe("Toggle input mode");
		});

		it("初期状態ではフォームモード(isTextMode=false)", () => {
			expect(modal.getIsTextMode()).toBe(false);
		});

		it("ボタンのテキストが初期状態では'テキストモード'", () => {
			const container = modal.contentEl;

			modal.testCreateToggleButton(container);

			const button = container.querySelector("button.mode-toggle-button");
			expect(button?.textContent).toBe("テキストモード");
		});

		it("ボタンクリックでモードが切り替わる", () => {
			const container = modal.contentEl;

			modal.testCreateToggleButton(container);

			const button = container.querySelector("button.mode-toggle-button") as HTMLButtonElement;
			expect(modal.getIsTextMode()).toBe(false);

			// クリックで切り替わる
			button.click();
			expect(modal.getIsTextMode()).toBe(true);
			expect(button.textContent).toBe("フォームモード");

			// 再度クリックで戻る
			button.click();
			expect(modal.getIsTextMode()).toBe(false);
			expect(button.textContent).toBe("テキストモード");
		});
	});

	describe("createTextModeArea", () => {
		it("テキストモード用のtextareaが作成される", () => {
			const container = modal.contentEl;

			modal.testCreateTextModeArea(container);

			// textareaが作成されている
			const textarea = container.querySelector("textarea.text-mode-input");
			expect(textarea).toBeTruthy();
			expect(textarea?.getAttribute("aria-label")).toBe("Todo.txt format input");
		});

		it("textareaの初期値は空文字", () => {
			const container = modal.contentEl;

			modal.testCreateTextModeArea(container);

			const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
			expect(textarea?.value).toBe("");
		});
	});

	describe("updateTextModeVisibility", () => {
		it("フォームモード時にtextareaが非表示", () => {
			const container = modal.contentEl;
			modal.testCreateTextModeArea(container);

			modal.testUpdateTextModeVisibility(container);

			const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
			expect(textarea?.style.display).toBe("none");
		});

		it("テキストモード時にtextareaが表示", () => {
			const container = modal.contentEl;
			modal.testCreateTextModeArea(container);

			// モードを切り替え
			modal.testCreateToggleButton(container);
			const button = container.querySelector("button.mode-toggle-button") as HTMLButtonElement;
			button.click();

			modal.testUpdateTextModeVisibility(container);

			const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
			expect(textarea?.style.display).toBe("");
		});
	});
});
