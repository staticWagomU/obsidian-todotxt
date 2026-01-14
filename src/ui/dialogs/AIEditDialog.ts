/**
 * AIEditDialog - AI-powered task editing dialog
 * Allows editing existing tasks using natural language input
 */

import { Modal, type App } from "obsidian";
import type { Todo } from "../../lib/todo";

export class AIEditDialog extends Modal {
	private todo: Todo;
	private onSuccess: () => void;

	constructor(
		app: App,
		todo: Todo,
		onSuccess: () => void,
	) {
		super(app);
		this.todo = todo;
		this.onSuccess = onSuccess;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("ai-edit-dialog");

		// ヘッダーセクション
		const headerEl = contentEl.createDiv("ai-dialog-header");
		headerEl.createEl("h2", { text: "AIタスク編集" });
		headerEl.createEl("p", {
			text: "自然な文章でタスクの変更を入力すると、AIが反映します",
			cls: "ai-dialog-description",
		});

		// 既存タスク表示
		const currentTaskSection = contentEl.createDiv("ai-dialog-current-task");
		currentTaskSection.createEl("h3", { text: "現在のタスク" });
		const currentTaskText = currentTaskSection.createEl("div", {
			cls: "current-task-text",
		});
		currentTaskText.textContent = this.todo.raw || this.todo.description;

		// ボタンエリア
		const buttonContainer = contentEl.createDiv("ai-dialog-buttons");

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
			cls: "ai-btn-cancel",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});

		// 自動フォーカス（将来的にテキストエリアを追加）
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
