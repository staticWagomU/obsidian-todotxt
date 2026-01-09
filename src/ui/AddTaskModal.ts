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
		// To be implemented in subsequent subtasks
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
