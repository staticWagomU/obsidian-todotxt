/**
 * AIDecomposeDialog - AI分解のカスタム指示入力ダイアログ
 * PBI-067 AC5対応: カスタム指示を入力してAIの分解方針を調整できる
 */

import { Modal, type App } from "obsidian";

export class AIDecomposeDialog extends Modal {
	private taskDescription: string;
	private customInstruction: string = "";
	private onSubmit: (customInstruction: string) => void;
	private instructionInput: HTMLTextAreaElement | null = null;

	constructor(
		app: App,
		taskDescription: string,
		onSubmit: (customInstruction: string) => void,
	) {
		super(app);
		this.taskDescription = taskDescription;
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("ai-decompose-dialog");

		contentEl.createEl("h2", { text: "タスクを分解" });

		// 対象タスク表示
		const taskContainer = contentEl.createDiv("task-container");
		taskContainer.createEl("label", { text: "分解対象タスク" });
		taskContainer.createEl("div", {
			cls: "ai-decompose-task-description",
			text: this.taskDescription,
		});

		// カスタム指示入力
		const instructionContainer = contentEl.createDiv("instruction-container");
		instructionContainer.createEl("label", { text: "分解の指示（オプション）" });
		instructionContainer.createEl("p", {
			cls: "setting-item-description ai-decompose-help-text",
			text: "AIにどのように分解してほしいか指示できます。例: 「技術的な観点で分解」「時系列順に並べる」",
		});

		this.instructionInput = instructionContainer.createEl("textarea", {
			cls: "custom-instruction-input ai-decompose-instruction-input",
			placeholder: "例: 技術的なステップに分解してください",
		});
		this.instructionInput.rows = 3;
		this.instructionInput.value = this.customInstruction;

		// Button container
		const buttonContainer = contentEl.createDiv("modal-button-container");

		const submitButton = buttonContainer.createEl("button", {
			text: "分解する",
			cls: "mod-cta",
		});
		submitButton.addEventListener("click", () => {
			this.handleSubmit();
		});

		const cancelButton = buttonContainer.createEl("button", {
			text: "キャンセル",
		});
		cancelButton.addEventListener("click", () => {
			this.close();
		});
	}

	/**
	 * Handle submit button click
	 */
	private handleSubmit(): void {
		if (this.instructionInput) {
			this.customInstruction = this.instructionInput.value.trim();
		}
		this.onSubmit(this.customInstruction);
		this.close();
	}

	/**
	 * Get current custom instruction
	 */
	getCustomInstruction(): string {
		return this.customInstruction;
	}

	/**
	 * Set custom instruction
	 */
	setCustomInstruction(instruction: string): void {
		this.customInstruction = instruction;
		if (this.instructionInput) {
			this.instructionInput.value = instruction;
		}
	}

	/**
	 * Get task description
	 */
	getTaskDescription(): string {
		return this.taskDescription;
	}

	/**
	 * Trigger submit action (for testing)
	 */
	triggerSubmit(): void {
		this.onSubmit(this.customInstruction);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.instructionInput = null;
	}
}
