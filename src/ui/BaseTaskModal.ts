/**
 * BaseTaskModal - タスクモーダルの基底クラス
 * 共通のラベル作成機能とマルチセレクト生成機能を提供
 */

import { Modal } from "obsidian";
import type { SelectOption } from "../lib/project-context-utils";

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
}
