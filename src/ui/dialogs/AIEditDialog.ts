/**
 * AIEditDialog - AI-powered task editing dialog
 * Allows editing existing tasks using natural language input
 */

import { Modal, type App, Notice, TFile } from "obsidian";
import type { Todo } from "../../lib/todo";
import { OpenRouterService } from "../../ai/openrouter";
import type { OpenRouterSettings } from "../../settings";

export class AIEditDialog extends Modal {
	private todo: Todo;
	private filePath: string;
	private lineIndex: number;
	private onSuccess: () => void;
	private settings: OpenRouterSettings;
	private previewSection: HTMLElement | null = null;
	private updatedTodoLine: string | null = null;

	constructor(
		app: App,
		todo: Todo,
		filePath: string,
		lineIndex: number,
		settings: OpenRouterSettings,
		onSuccess: () => void,
	) {
		super(app);
		this.todo = todo;
		this.filePath = filePath;
		this.lineIndex = lineIndex;
		this.settings = settings;
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

	async handleGenerate(naturalLanguage: string): Promise<void> {
		if (!naturalLanguage.trim()) {
			new Notice("変更内容を入力してください");
			return;
		}

		if (!this.settings.apiKey) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case -- API key is a proper noun
			new Notice("OpenRouter API key is not configured");
			return;
		}

		// Show loading notice
		 
		const loadingNotice = new Notice("AIが編集中...", 0);
		 

		try {
			const service = new OpenRouterService({
				apiKey: this.settings.apiKey,
				model: this.settings.model,
				retryConfig: this.settings.retryConfig,
			});

			const currentDate = new Date().toISOString().split("T")[0] || "";
			const result = await service.editTodo(
				this.todo,
				naturalLanguage,
				currentDate,
				this.settings.customContexts,
			);

			loadingNotice.hide();

			if (!result.success || !result.updatedTodoLine) {
				const errorMsg = result.error || "不明なエラー";
				new Notice("編集に失敗しました: " + errorMsg);
				return;
			}

			// Store updated todo line and show preview
			this.updatedTodoLine = result.updatedTodoLine;
			this.showPreview(result.updatedTodoLine);
		} catch (error) {
			loadingNotice.hide();
			const errorMsg = error instanceof Error ? error.message : "不明なエラー";
			new Notice("エラーが発生しました: " + errorMsg);
		}
	}

	private showPreview(updatedTodoLine: string): void {
		const { contentEl } = this;

		// Remove preview section if it exists
		if (this.previewSection) {
			this.previewSection.remove();
		}

		// Create preview section
		this.previewSection = contentEl.createDiv("ai-dialog-preview");
		this.previewSection.createEl("h3", { text: "プレビュー" });

		const previewText = this.previewSection.createDiv({
			cls: "preview-todo-text",
		});
		previewText.textContent = updatedTodoLine;

		// Add save button
		const buttonContainer = this.previewSection.createDiv("ai-dialog-buttons");

		const saveButton = buttonContainer.createEl("button", {
			text: "保存",
			cls: "mod-cta ai-btn-save",
		});
		saveButton.addEventListener("click", () => {
			// TODO: Implement in Subtask 4
			void this.handleSave();
		});

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
			cls: "ai-btn-cancel",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});
	}

	async handleSave(): Promise<void> {
		if (!this.updatedTodoLine) {
			new Notice("更新内容がありません");
			return;
		}

		try {
			const file = this.app.vault.getAbstractFileByPath(this.filePath);
			if (!(file instanceof TFile)) {
				new Notice("ファイルが見つかりません: " + this.filePath);
				return;
			}

			// Read current file content
			const content = await this.app.vault.read(file);
			const lines = content.split("\n");

			// Update the specific line with the AI-edited todo
			lines[this.lineIndex] = this.updatedTodoLine;

			// Write back to file
			await this.app.vault.modify(file, lines.join("\n"));

			new Notice("タスクを更新しました");
			this.close();
			this.onSuccess();
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "不明なエラー";
			new Notice("保存に失敗しました: " + errorMsg);
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
