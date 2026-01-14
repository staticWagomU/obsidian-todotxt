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

		// 自然言語入力エリア
		const inputSection = contentEl.createDiv("ai-dialog-input-section");
		inputSection.createEl("h3", { text: "変更内容を入力" });

		const textarea = inputSection.createEl("textarea", {
			cls: "ai-edit-textarea",
		});
		/* eslint-disable obsidianmd/ui/sentence-case -- Japanese text does not require sentence case */
		textarea.setAttribute(
			"placeholder",
			"変更内容を自然な文章で入力してください...\n\n例:\n・明日までに期限を設定\n・優先度をAに変更\n・@homeコンテキストを追加",
		);
		/* eslint-enable obsidianmd/ui/sentence-case */
		textarea.rows = 6;

		// ボタンエリア
		const buttonContainer = contentEl.createDiv("ai-dialog-buttons");

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
			cls: "ai-btn-cancel",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});

		const generateButton = buttonContainer.createEl("button", {
			text: "AI編集実行",
			cls: "mod-cta ai-btn-generate",
		});
		generateButton.addEventListener("click", () => {
			// TODO: Implement in Subtask 3
			void this.handleGenerate(textarea.value);
		});

		// 自動フォーカス
		textarea.focus();
	}

	async handleGenerate(_naturalLanguage: string): Promise<void> {
		// TODO: Implement in Subtask 3
		// For now, just close the dialog
		this.close();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
