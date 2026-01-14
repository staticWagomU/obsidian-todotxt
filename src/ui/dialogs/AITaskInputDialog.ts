/**
 * AITaskInputDialog - Natural language task input dialog
 * Converts natural language to todo.txt format using OpenRouter API
 */

import { Modal, type App, Notice } from "obsidian";
import { OpenRouterService } from "../../ai/openrouter";
import type { OpenRouterSettings } from "../../settings";
import { AITaskPreviewDialog } from "./AITaskPreviewDialog";

export class AITaskInputDialog extends Modal {
	private settings: OpenRouterSettings;
	private onSuccess: () => void;
	private filePath: string;

	constructor(
		app: App,
		settings: OpenRouterSettings,
		filePath: string,
		onSuccess: () => void,
	) {
		super(app);
		this.settings = settings;
		this.filePath = filePath;
		this.onSuccess = onSuccess;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("ai-task-input-dialog");

		// ヘッダーセクション
		const headerEl = contentEl.createDiv("ai-dialog-header");
		headerEl.createEl("h2", { text: "AIタスク追加" });
		headerEl.createEl("p", {
			text: "自然な文章でタスクを入力すると、AIがtodo.txt形式に変換します",
			cls: "ai-dialog-description",
		});

		// メイン入力エリア
		const inputSection = contentEl.createDiv("ai-dialog-input-section");

		const textarea = inputSection.createEl("textarea", {
			cls: "ai-task-textarea",
		});
		textarea.setAttribute(
			"placeholder",
			"タスクを入力してください...\n\n例:\n・明日までに報告書を作成する #pc\n・買い物リストを作る @home\n・緊急で会議の準備をする +ProjectX",
		);
		textarea.rows = 8;

		// ヒントセクション
		const hintSection = contentEl.createDiv("ai-dialog-hints");
		const hints = [
			{ icon: "#", text: "コンテキスト", example: "@home @office" },
			{ icon: "+", text: "プロジェクト", example: "+Work +Personal" },
			{ icon: "📅", text: "期限", example: "明日まで、来週金曜" },
		];
		for (const hint of hints) {
			const hintItem = hintSection.createDiv("ai-hint-item");
			hintItem.createSpan({ text: hint.icon, cls: "ai-hint-icon" });
			hintItem.createSpan({ text: hint.text, cls: "ai-hint-label" });
			hintItem.createSpan({ text: hint.example, cls: "ai-hint-example" });
		}

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
			text: "AIで生成",
			cls: "mod-cta ai-btn-generate",
		});
		generateButton.addEventListener("click", () => {
			void this.handleGenerate(textarea.value);
		});

		// 自動フォーカス
		textarea.focus();
	}

	async handleGenerate(naturalLanguage: string): Promise<void> {
		if (!naturalLanguage.trim()) {
			new Notice("タスク内容を入力してください");
			return;
		}

		if (!this.settings.apiKey) {
			new Notice("Openrouter API key is not configured");
			return;
		}

		// Show loading notice
		const loadingNotice = new Notice("AIが変換中...", 0);

		try {
			const service = new OpenRouterService({
				apiKey: this.settings.apiKey,
				model: this.settings.model,
				retryConfig: this.settings.retryConfig,
			});

			const currentDate = new Date().toISOString().split("T")[0] || "";
			const result = await service.convertToTodotxt(
				naturalLanguage,
				currentDate,
				this.settings.customContexts,
			);

			loadingNotice.hide();

			if (!result.success || !result.todoLines) {
				const errorMsg = result.error || "不明なエラー";
				new Notice("変換に失敗しました: " + errorMsg);
				return;
			}

			// Close this dialog and open preview dialog
			this.close();
			const previewDialog = new AITaskPreviewDialog(
				this.app,
				result.todoLines,
				this.filePath,
				this.onSuccess,
			);
			previewDialog.open();
		} catch (error) {
			loadingNotice.hide();
			const errorMsg = error instanceof Error ? error.message : "不明なエラー";
			new Notice("エラーが発生しました: " + errorMsg);
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
