/**
 * FocusViewModal - フォーカスビューモーダル
 * 今日やるべきタスク（due:today以前またはt:today以前）を一覧表示
 */

import { Modal, type App } from "obsidian";
import type { Todo } from "../lib/todo";
import { filterFocusTodos, sortFocusTodos } from "../lib/focus-filter";

/**
 * フォーカスビューのコールバック定義
 */
export interface FocusViewCallbacks {
	onToggleComplete: (index: number) => void;
}

/**
 * フォーカスビューモーダルのオプション
 */
export interface FocusViewModalOptions {
	todos: Todo[];
	onToggleComplete: (todo: Todo, originalIndex: number) => void;
}

/**
 * タスクをフィルタしてソートする（テスト用にエクスポート）
 */
export function filterAndSortFocusTodos(todos: Todo[], today: Date): Todo[] {
	const filtered = filterFocusTodos(todos, today);
	return sortFocusTodos(filtered);
}

/**
 * DOM要素作成ヘルパー
 * Obsidian APIのcreateElがない環境（テスト環境など）でも動作する
 */
function createEl(
	parent: HTMLElement,
	tag: string,
	options?: { text?: string; cls?: string; type?: string },
): HTMLElement {
	const el = document.createElement(tag);
	if (options?.text) {
		el.textContent = options.text;
	}
	if (options?.cls) {
		el.classList.add(options.cls);
	}
	if (options?.type && tag === "input") {
		(el as HTMLInputElement).type = options.type;
	}
	parent.appendChild(el);
	return el;
}

/**
 * フォーカスビューのコンテンツを作成（テスト用にエクスポート）
 */
export function createFocusViewContent(
	container: HTMLElement,
	todos: Todo[],
	today: Date,
	callbacks: FocusViewCallbacks,
): void {
	// Clear container (compatible with both Obsidian and standard DOM)
	if ("empty" in container && typeof container.empty === "function") {
		container.empty();
	} else {
		container.innerHTML = "";
	}

	// Header
	createEl(container, "h2", { text: "今日のフォーカスタスク" });

	// Filter and sort tasks
	const focusTodos = filterAndSortFocusTodos(todos, today);

	if (focusTodos.length === 0) {
		// Empty state
		createEl(container, "p", {
			text: "今日のタスクはありません。",
			cls: "focus-view-empty",
		});
		return;
	}

	// Task count
	createEl(container, "p", {
		text: `${focusTodos.length} 件のタスク`,
		cls: "focus-view-count",
	});

	// Task list
	const listContainer = createEl(container, "div", { cls: "focus-view-list" });

	// Create index map for original indices
	const originalIndices = focusTodos.map((focusTodo) =>
		todos.findIndex((t) => t === focusTodo)
	);

	for (let i = 0; i < focusTodos.length; i++) {
		const todo = focusTodos[i];
		if (!todo) continue;

		const originalIndex = originalIndices[i];
		if (originalIndex === undefined) continue;

		const itemEl = createEl(listContainer, "div", { cls: "focus-view-item" });

		// Checkbox
		const checkbox = createEl(itemEl, "input", { type: "checkbox" }) as HTMLInputElement;
		checkbox.classList.add("focus-view-checkbox");
		checkbox.checked = todo.completed;
		checkbox.addEventListener("click", () => {
			callbacks.onToggleComplete(originalIndex);
		});

		// Content container
		const contentEl = createEl(itemEl, "div", { cls: "focus-view-content" });

		// Priority
		if (todo.priority) {
			createEl(contentEl, "span", {
				text: `(${todo.priority})`,
				cls: "focus-view-priority",
			});
		}

		// Description
		createEl(contentEl, "span", {
			text: todo.description,
			cls: "focus-view-description",
		});

		// Due date
		if (todo.tags.due) {
			createEl(contentEl, "span", {
				text: `due:${todo.tags.due}`,
				cls: "focus-view-due",
			});
		}

		// Threshold date
		if (todo.tags.t && !todo.tags.due) {
			createEl(contentEl, "span", {
				text: `t:${todo.tags.t}`,
				cls: "focus-view-threshold",
			});
		}
	}
}

/**
 * フォーカスビューモーダル
 */
export class FocusViewModal extends Modal {
	private todos: Todo[];
	private onToggleCompleteCallback: (todo: Todo, originalIndex: number) => void;

	constructor(app: App, options: FocusViewModalOptions) {
		super(app);
		this.todos = options.todos;
		this.onToggleCompleteCallback = options.onToggleComplete;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.classList.add("focus-view-modal");

		const today = new Date();
		createFocusViewContent(contentEl, this.todos, today, {
			onToggleComplete: (originalIndex: number) => {
				const todo = this.todos[originalIndex];
				if (todo) {
					this.onToggleCompleteCallback(todo, originalIndex);
					this.close();
				}
			},
		});

		// Close button
		const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
		const closeButton = buttonContainer.createEl("button", { text: "閉じる" });
		closeButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
