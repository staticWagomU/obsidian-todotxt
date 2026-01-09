/**
 * AddTaskModal - タスク追加モーダル
 */

import { Modal, type App } from "obsidian";

export class AddTaskModal extends Modal {
	onSave: (description: string, priority?: string) => void;

	constructor(app: App, onSave: (description: string, priority?: string) => void) {
		super(app);
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;

		// Task description input
		const input = contentEl.createEl("input");
		input.type = "text";
		input.classList.add("task-description-input");
		input.placeholder = "タスクを入力...";
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
