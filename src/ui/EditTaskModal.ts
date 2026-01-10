/**
 * EditTaskModal - タスク編集モーダル
 */

import { Modal, type App } from "obsidian";

export class EditTaskModal extends Modal {
	onSave: (description: string, priority?: string) => void;
	initialDescription: string;

	constructor(app: App, initialDescription: string, onSave: (description: string, priority?: string) => void) {
		super(app);
		this.initialDescription = initialDescription;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;

		// Task description input
		const input = contentEl.createEl("input");
		input.type = "text";
		input.classList.add("task-description-input");
		input.placeholder = "タスクを入力...";
		input.value = this.initialDescription;

		// Save button
		const saveButton = contentEl.createEl("button");
		saveButton.classList.add("save-task-button");
		saveButton.textContent = "保存";
		saveButton.addEventListener("click", () => {
			const description = input.value.trim();
			if (description) {
				this.onSave(description, undefined);
				this.close();
			}
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
