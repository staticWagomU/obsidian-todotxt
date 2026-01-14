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

		contentEl.createEl("h2", { text: "AIタスク追加" });
		contentEl.createEl("p", {
			text: "自然な文章でタスクを入力してください。AIがtodo.txt形式に変換します。",
		});

		// Natural language input
		const inputContainer = contentEl.createDiv("input-container");
		inputContainer.createEl("label", { text: "タスクの内容" });
		const textarea = inputContainer.createEl("textarea", {
			cls: "natural-language-input",
		});
		const placeholderText = "例: 明日までに報告書を作成する #pc\n買い物リストを作る @home\n緊急で会議の準備をする +ProjectX";
		textarea.setAttribute("placeholder", placeholderText);
		textarea.rows = 6;

		// Button container
		const buttonContainer = contentEl.createDiv("modal-button-container");

		const generateButton = buttonContainer.createEl("button", {
			text: "生成",
			cls: "mod-cta",
		});
		generateButton.addEventListener("click", () => {
			void this.handleGenerate(textarea.value);
		});

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});
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

			const currentDate = new Date().toISOString().split("T")[0];
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
