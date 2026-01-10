/**
 * BaseTaskModal - タスクモーダルの基底クラス
 * 共通のラベル作成機能とマルチセレクト生成機能を提供
 */

import { Modal } from "obsidian";
import type { SelectOption } from "../lib/project-context-utils";
import { extractProjects, extractContexts } from "../lib/suggestions";
import { renderProjectOptions, renderContextOptions } from "../lib/project-context-utils";
import type { Todo } from "../lib/todo";
import { serializeTodo } from "../lib/parser";
import {
	buildDescriptionWithTags,
	buildTextFromFormValues,
	parseFormValuesFromText,
} from "../utils/form-helpers";

export abstract class BaseTaskModal extends Modal {
	protected isTextMode = false;

	/**
	 * ラベル要素を作成してコンテナに追加
	 * @param container 親要素
	 * @param text ラベルテキスト
	 */
	protected createLabel(container: HTMLElement, text: string): void {
		const label = container.createEl("label", {
			cls: "modal-form-label",
		});
		label.textContent = text;
	}

	/**
	 * マルチセレクト要素を作成してコンテナに追加
	 * @param container 親要素
	 * @param options 選択肢の配列
	 * @param className セレクト要素のクラス名
	 * @returns 作成されたselect要素
	 */
	protected createMultiSelect(
		container: HTMLElement,
		options: SelectOption[],
		className: string,
	): HTMLSelectElement {
		const select = container.createEl("select");
		select.classList.add(className);
		select.multiple = true;

		for (const option of options) {
			const optionEl = select.createEl("option");
			optionEl.textContent = option.label;
			optionEl.value = option.value;
		}

		return select;
	}

	/**
	 * プロジェクト/コンテキスト選択UIを作成
	 * @param container 親要素
	 * @param todos 既存タスク配列
	 * @returns プロジェクト/コンテキストのselect要素を含むオブジェクト
	 */
	protected createProjectContextSelects(
		container: HTMLElement,
		todos: Todo[],
	): { projectSelect: HTMLSelectElement; contextSelect: HTMLSelectElement } {
		// Project multi-select
		this.createLabel(container, "プロジェクト (+)");
		const projects = extractProjects(todos);
		const projectOptions = renderProjectOptions(projects);
		const projectSelect = this.createMultiSelect(container, projectOptions, "project-select");

		// Context multi-select
		this.createLabel(container, "コンテキスト (@)");
		const contexts = extractContexts(todos);
		const contextOptions = renderContextOptions(contexts);
		const contextSelect = this.createMultiSelect(container, contextOptions, "context-select");

		return { projectSelect, contextSelect };
	}

	/**
	 * モード切替ボタンを作成
	 * @param container 親要素
	 */
	protected createToggleButton(container: HTMLElement): void {
		const button = container.createEl("button", {
			cls: "mode-toggle-button",
		});
		button.setAttribute("aria-label", "Toggle input mode");
		button.textContent = this.isTextMode ? "フォームモード" : "テキストモード";

		button.addEventListener("click", () => {
			this.isTextMode = !this.isTextMode;
			button.textContent = this.isTextMode ? "フォームモード" : "テキストモード";
		});
	}

	/**
	 * テキストモード用のtextareaを作成
	 * @param container 親要素
	 */
	protected createTextModeArea(container: HTMLElement): void {
		const textarea = container.createEl("textarea", {
			cls: "text-mode-input",
		});
		textarea.setAttribute("aria-label", "Todo.txt format input");
		textarea.value = "";
	}

	/**
	 * テキストモードの表示/非表示を更新
	 * @param container textareaを含む親要素
	 */
	protected updateTextModeVisibility(container: HTMLElement): void {
		const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
		if (!textarea) {
			return;
		}
		textarea.style.display = this.isTextMode ? "" : "none";
	}


	/**
	 * モード切替時の値変換処理
	 * @param container フォーム要素とtextareaを含む親要素
	 */
	protected onToggleMode(container: HTMLElement): void {
		const textarea = container.querySelector("textarea.text-mode-input") as HTMLTextAreaElement;
		const descInput = container.querySelector("input.task-description-input") as HTMLInputElement;
		const prioritySelect = container.querySelector("select.priority-select") as HTMLSelectElement;
		const dueDateInput = container.querySelector("input.due-date-input") as HTMLInputElement;
		const thresholdDateInput = container.querySelector("input.threshold-date-input") as HTMLInputElement;

		if (!textarea || !descInput || !prioritySelect || !dueDateInput) {
			return;
		}

		if (this.isTextMode) {
			// フォーム → テキスト: フォーム値をテキストに変換
			const description = descInput.value.trim();
			const priority = prioritySelect.value || undefined;
			const dueDate = dueDateInput.value || undefined;
			const thresholdDate = thresholdDateInput?.value || undefined;

			if (description) {
				textarea.value = buildTextFromFormValues(description, priority, dueDate, thresholdDate);
			}
		} else {
			// テキスト → フォーム: テキストをフォーム値に変換
			const text = textarea.value.trim();
			if (text) {
				const values = parseFormValuesFromText(text);
				descInput.value = values.description;
				prioritySelect.value = values.priority || "";
				dueDateInput.value = values.dueDate || "";
				if (thresholdDateInput) {
					thresholdDateInput.value = values.thresholdDate || "";
				}
			}
		}
	}

	/**
	 * プレビューエリアを作成
	 * @param container 親要素
	 */
	protected createPreviewArea(container: HTMLElement): void {
		this.createLabel(container, "プレビュー");
		const previewEl = container.createEl("pre", {
			cls: "modal-form-preview preview-area",
		});
		previewEl.setAttribute("aria-label", "Todo.txt format preview");
	}

	/**
	 * プレビューエリアを更新
	 * @param container プレビューエリアを含む親要素
	 * @param todo プレビュー対象のTodoオブジェクト
	 */
	protected updatePreview(container: HTMLElement, todo: Todo): void {
		const previewEl = container.querySelector("pre.preview-area");
		if (!previewEl) {
			return;
		}
		previewEl.textContent = serializeTodo(todo);
	}

	/**
	 * フォーム値からTodoオブジェクトを構築してプレビューを更新
	 * @param container プレビューエリアを含む親要素
	 * @param description タスク説明
	 * @param priority 優先度
	 * @param dueDate 期限日
	 * @param thresholdDate 開始日
	 */
	protected updatePreviewFromFormValues(
		container: HTMLElement,
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	): void {
		if (!description) {
			return;
		}

		const today = new Date().toISOString().split("T")[0];
		const descriptionWithTags = buildDescriptionWithTags(description, dueDate, thresholdDate);

		const previewTodo: Todo = {
			completed: false,
			priority,
			creationDate: today,
			description: descriptionWithTags,
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		this.updatePreview(container, previewTodo);
	}
}
