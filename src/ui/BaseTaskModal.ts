/**
 * BaseTaskModal - タスクモーダルの基底クラス
 * 共通のラベル作成機能を提供
 */

import { Modal } from "obsidian";

export abstract class BaseTaskModal extends Modal {
	/**
	 * ラベル要素を作成してコンテナに追加
	 * @param container 親要素
	 * @param text ラベルテキスト
	 */
	protected createLabel(container: HTMLElement, text: string): void {
		const label = container.createEl("label");
		label.textContent = text;
		label.style.display = "block";
		label.style.marginTop = "10px";
	}
}
