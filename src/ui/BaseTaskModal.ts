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
import { buildDescriptionWithTags } from "../utils/form-helpers";

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
