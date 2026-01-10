/**
 * EditTaskModal - タスク編集モーダル (stub for RED phase)
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
		// To be implemented
	}

	onClose(): void {
		// To be implemented
	}
}
