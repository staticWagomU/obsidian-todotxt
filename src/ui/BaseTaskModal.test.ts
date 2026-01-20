/**
 * BaseTaskModal - プレビュー機能のテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseTaskModal } from "./BaseTaskModal";
import type { App } from "obsidian";
import type { Todo } from "../lib/todo";
import { buildTextFromFormValues, parseFormValuesFromText } from "../utils/form-helpers";

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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			scope: any;

			constructor(app: unknown) {
				this.app = app;
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.empty = () => { container.innerHTML = ""; };
				// Mock scope with register method
				const registeredHandlers: { modifiers: string[]; key: string; handler: (event: KeyboardEvent) => boolean | void }[] = [];
				this.scope = {
					registeredHandlers,
					register(modifiers: string[], key: string, handler: (event: KeyboardEvent) => boolean | void): void {
						registeredHandlers.push({ modifiers, key, handler });
					},
				};
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

	public testOnToggleMode(container: HTMLElement): void {
		this.onToggleMode(container);
	}

	public testSetupSaveShortcut(handler: () => void): void {
		this.setupSaveShortcut(handler);
	}

	public getScope(): { registeredHandlers: { modifiers: string[]; key: string; handler: (event: KeyboardEvent) => boolean | void }[] } {
		return (this as unknown as { scope: { registeredHandlers: { modifiers: string[]; key: string; handler: (event: KeyboardEvent) => boolean | void }[] } }).scope;
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

	describe("buildTextFromFormValues (utility)", () => {
		it("フォーム値からtodo.txt形式のテキストを構築", () => {
			const text = buildTextFromFormValues(
				"Test task",
				"A",
				"2026-01-15",
				"2026-01-12",
			);

			expect(text).toBe("(A) Test task due:2026-01-15 t:2026-01-12");
		});

		it("優先度なしの場合", () => {
			const text = buildTextFromFormValues(
				"Test task",
				undefined,
				"2026-01-15",
			);

			expect(text).toBe("Test task due:2026-01-15");
		});

		it("タグなしの場合", () => {
			const text = buildTextFromFormValues("Test task", "B");

			expect(text).toBe("(B) Test task");
		});
	});

	describe("parseFormValuesFromText (utility)", () => {
		it("todo.txt形式のテキストからフォーム値を抽出", () => {
			const values = parseFormValuesFromText("(A) Test task due:2026-01-15 t:2026-01-12");

			expect(values.description).toBe("Test task");
			expect(values.priority).toBe("A");
			expect(values.dueDate).toBe("2026-01-15");
			expect(values.thresholdDate).toBe("2026-01-12");
		});

		it("優先度なしのテキスト", () => {
			const values = parseFormValuesFromText("Test task due:2026-01-15");

			expect(values.description).toBe("Test task");
			expect(values.priority).toBeUndefined();
			expect(values.dueDate).toBe("2026-01-15");
		});

		it("タグなしのテキスト", () => {
			const values = parseFormValuesFromText("(B) Test task");

			expect(values.description).toBe("Test task");
			expect(values.priority).toBe("B");
			expect(values.dueDate).toBeUndefined();
			expect(values.thresholdDate).toBeUndefined();
		});
	});

	describe("onToggleMode", () => {
		it("フォーム→テキスト切替時にフォーム値をテキストに変換", () => {
			const container = modal.contentEl;

			// フォーム要素を作成
			const descInput = container.createEl("input");
			descInput.classList.add("task-description-input");
			descInput.value = "Test task";

			const prioritySelect = container.createEl("select");
			prioritySelect.classList.add("priority-select");
			const option = prioritySelect.createEl("option");
			option.value = "A";
			prioritySelect.value = "A";

			const dueDateInput = container.createEl("input");
			dueDateInput.classList.add("due-date-input");
			dueDateInput.value = "2026-01-15";

			// textareaを作成
			modal.testCreateTextModeArea(container);

			// モード切替
			modal.testCreateToggleButton(container);
			const button = container.querySelector("button.mode-toggle-button") as HTMLButtonElement;
			button.click();

			modal.testOnToggleMode(container);

			const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
			expect(textarea.value).toBe("(A) Test task due:2026-01-15");
		});

		it("テキスト→フォーム切替時にテキストをフォーム値に変換", () => {
			const container = modal.contentEl;

			// フォーム要素を作成
			const descInput = container.createEl("input");
			descInput.classList.add("task-description-input");

			const prioritySelect = container.createEl("select");
			prioritySelect.classList.add("priority-select");
			const optionA = prioritySelect.createEl("option");
			optionA.value = "A";
			const optionB = prioritySelect.createEl("option");
			optionB.value = "B";

			const dueDateInput = container.createEl("input");
			dueDateInput.classList.add("due-date-input");

			const thresholdDateInput = container.createEl("input");
			thresholdDateInput.classList.add("threshold-date-input");

			// textareaを作成してテキストを設定
			modal.testCreateTextModeArea(container);
			const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
			textarea.value = "(B) New task due:2026-02-01 t:2026-01-20";

			// テキストモードに切り替え
			modal.testCreateToggleButton(container);
			const button = container.querySelector("button.mode-toggle-button") as HTMLButtonElement;
			button.click();

			// フォームモードに戻す
			button.click();
			modal.testOnToggleMode(container);

			expect(descInput.value).toBe("New task");
			expect(prioritySelect.value).toBe("B");
			expect(dueDateInput.value).toBe("2026-02-01");
			expect(thresholdDateInput.value).toBe("2026-01-20");
		});
	});

	describe("setupSaveShortcut", () => {
		it("Ctrl+Enterのショートカットが登録される", () => {
			const saveHandler = vi.fn();
			modal.testSetupSaveShortcut(saveHandler);

			const handlers = modal.getScope().registeredHandlers;
			expect(handlers.length).toBe(2);

			// Ctrl+Enter
			expect(handlers[0]?.modifiers).toContain("Ctrl");
			expect(handlers[0]?.key).toBe("Enter");

			// Meta+Enter (Cmd on Mac)
			expect(handlers[1]?.modifiers).toContain("Meta");
			expect(handlers[1]?.key).toBe("Enter");
		});

		it("ショートカット実行時にハンドラーが呼ばれる", () => {
			const saveHandler = vi.fn();
			modal.testSetupSaveShortcut(saveHandler);

			const handlers = modal.getScope().registeredHandlers;

			// Ctrl+Enterハンドラーを実行
			const preventDefaultMock = vi.fn();
			const mockEvent = { preventDefault: preventDefaultMock } as unknown as KeyboardEvent;
			handlers[0]?.handler(mockEvent);

			expect(saveHandler).toHaveBeenCalledTimes(1);
			expect(preventDefaultMock).toHaveBeenCalled();
		});

		it("Meta+Enterでもハンドラーが呼ばれる（macOS対応）", () => {
			const saveHandler = vi.fn();
			modal.testSetupSaveShortcut(saveHandler);

			const handlers = modal.getScope().registeredHandlers;

			// Meta+Enterハンドラーを実行
			const preventDefaultMock = vi.fn();
			const mockEvent = { preventDefault: preventDefaultMock } as unknown as KeyboardEvent;
			handlers[1]?.handler(mockEvent);

			expect(saveHandler).toHaveBeenCalledTimes(1);
			expect(preventDefaultMock).toHaveBeenCalled();
		});
	});
});
