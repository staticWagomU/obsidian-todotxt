/**
 * AIDecomposePreviewDialog - AI分解結果のプレビュー・編集ダイアログ
 * PBI-067 AC4対応: プレビュー画面で編集してから追加できる
 */

import { Modal, type App, Notice } from "obsidian";

export class AIDecomposePreviewDialog extends Modal {
	private subtaskLines: string[];
	private onConfirm: (subtaskLines: string[]) => void;
	private textarea: HTMLTextAreaElement | null = null;

	constructor(
		app: App,
		subtaskLines: string[],
		onConfirm: (subtaskLines: string[]) => void,
	) {
		super(app);
		this.subtaskLines = [...subtaskLines];
		this.onConfirm = onConfirm;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("ai-decompose-preview-dialog");

		contentEl.createEl("h2", { text: "分解されたサブタスクをプレビュー" });
		contentEl.createEl("p", {
			text: "生成されたサブタスクを確認・編集できます。各行が1つのサブタスクになります。",
		});

		// Preview/Edit area
		const previewContainer = contentEl.createDiv("preview-container");
		previewContainer.createEl("label", { text: "サブタスク（編集可能）" });
		this.textarea = previewContainer.createEl("textarea", {
			cls: "subtask-preview-textarea",
		});
		this.textarea.value = this.subtaskLines.join("\n");
		this.textarea.rows = Math.max(6, this.subtaskLines.length + 2);

		// Task count info
		const infoEl = contentEl.createEl("p", { cls: "subtask-count-info" });
		this.updateTaskCount(infoEl);

		// Listen for textarea changes to update count
		this.textarea.addEventListener("input", () => {
			this.updateTaskCount(infoEl);
		});

		// Button container
		const buttonContainer = contentEl.createDiv("modal-button-container");

		const addButton = buttonContainer.createEl("button", {
			text: "追加",
			cls: "mod-cta",
		});
		addButton.addEventListener("click", () => {
			this.handleConfirm();
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
		infoEl.textContent = `${lines.length}個のサブタスク`;
	}

	/**
	 * Handle confirm button click
	 */
	private handleConfirm(): void {
		if (!this.textarea) return;

		const taskText = this.textarea.value.trim();
		if (!taskText) {
			new Notice("サブタスクが空です");
			return;
		}

		// Update subtaskLines from textarea
		this.subtaskLines = taskText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);

		this.onConfirm(this.subtaskLines);
		this.close();
	}

	/**
	 * Get current subtask lines
	 */
	getSubtaskLines(): string[] {
		return [...this.subtaskLines];
	}

	/**
	 * Set subtask lines (for editing)
	 */
	setSubtaskLines(subtaskLines: string[]): void {
		this.subtaskLines = [...subtaskLines];
		if (this.textarea) {
			this.textarea.value = subtaskLines.join("\n");
		}
	}

	/**
	 * Trigger confirm action (for testing)
	 */
	triggerConfirm(): void {
		this.onConfirm(this.subtaskLines);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.textarea = null;
	}
}
