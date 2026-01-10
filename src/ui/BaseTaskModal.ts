/**
 * BaseTaskModal - タスクモーダルの基底クラス
 * 共通のラベル作成機能とマルチセレクト生成機能を提供
 */

import { Modal } from "obsidian";
import type { SelectOption } from "../lib/project-context-utils";
import { extractProjects, extractContexts } from "../lib/suggestions";
import { renderProjectOptions, renderContextOptions } from "../lib/project-context-utils";
import type { Todo } from "../lib/todo";

export abstract class BaseTaskModal extends Modal {
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
}
