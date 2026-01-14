/**
 * AITaskPreviewDialog - Preview and edit AI-generated tasks
 * Allows preview, editing, regeneration, and file appending
 */

import { Modal, type App, Notice, TFile } from "obsidian";

export class AITaskPreviewDialog extends Modal {
	private todoLines: string[];
	private filePath: string;
	private onSuccess: () => void;
	private textarea: HTMLTextAreaElement | null = null;

	constructor(
		app: App,
		todoLines: string[],
		filePath: string,
		onSuccess: () => void,
	) {
		super(app);
		this.todoLines = todoLines;
		this.filePath = filePath;
		this.onSuccess = onSuccess;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("ai-task-preview-dialog");

		contentEl.createEl("h2", { text: "生成されたタスクをプレビュー" });
		contentEl.createEl("p", {
			text: "生成されたtodo.txt形式のタスクを確認・編集できます。",
		});

		// Preview/Edit area
		const previewContainer = contentEl.createDiv("preview-container");
		previewContainer.createEl("label", { text: "タスク（編集可能）" });
		this.textarea = previewContainer.createEl("textarea", {
			cls: "task-preview-textarea",
		});
		this.textarea.value = this.todoLines.join("\n");
		this.textarea.rows = Math.max(6, this.todoLines.length + 2);

		// Task count info
		const infoEl = contentEl.createEl("p", { cls: "task-count-info" });
		this.updateTaskCount(infoEl);

		// Button container
		const buttonContainer = contentEl.createDiv("modal-button-container");

		const addButton = buttonContainer.createEl("button", {
			text: "追加",
			cls: "mod-cta",
		});
		addButton.addEventListener("click", () => {
			void this.handleAdd();
		});

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});
	}

	/**
	 * Update task count display
	 */
	private updateTaskCount(infoEl: HTMLElement): void {
		if (!this.textarea) return;
		const lines = this.textarea.value
			.split("\n")
			.filter((line) => line.trim().length > 0);
		infoEl.textContent = `${lines.length}個のタスク`;
	}

	/**
	 * Handle add button click - append tasks to file
	 */
	async handleAdd(): Promise<void> {
		if (!this.textarea) return;

		const taskText = this.textarea.value.trim();
		if (!taskText) {
			new Notice("タスクが空です");
			return;
		}

		try {
			const file = this.app.vault.getAbstractFileByPath(this.filePath);
			if (!(file instanceof TFile)) {
				new Notice("ファイルが見つかりません: " + this.filePath);
				return;
			}

			const currentContent = await this.app.vault.read(file);
			const newContent = currentContent
				? currentContent + "\n" + taskText
				: taskText;
			await this.app.vault.modify(file, newContent);

			const taskCount = taskText.split("\n").filter((line) => line.trim()).length;
			new Notice(`${taskCount}個のタスクを追加しました`);

			this.close();
			this.onSuccess();
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "不明なエラー";
			new Notice("タスクの追加に失敗しました: " + errorMsg);
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.textarea = null;
	}
}
