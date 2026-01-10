/**
 * EditTaskModal - タスク編集モーダル
 */

import { Modal, type App } from "obsidian";
import { generatePriorityOptions } from "../lib/priority-options";

export class EditTaskModal extends Modal {
	onSave: (description: string, priority?: string) => void;
	initialDescription: string;
	initialPriority?: string;

	constructor(
		app: App,
		initialDescription: string,
		onSave: (description: string, priority?: string) => void,
		initialPriority?: string,
	) {
		super(app);
		this.initialDescription = initialDescription;
		this.initialPriority = initialPriority;
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

		// Priority select
		const prioritySelect = contentEl.createEl("select");
		prioritySelect.classList.add("priority-select");
		const priorityOptions = generatePriorityOptions();
		for (const option of priorityOptions) {
			const optionEl = prioritySelect.createEl("option");
			optionEl.textContent = option.label;
			optionEl.value = option.value ?? "";
		}
		// Set initial priority selection
		prioritySelect.value = this.initialPriority ?? "";

		// Save button
		const saveButton = contentEl.createEl("button");
		saveButton.classList.add("save-task-button");
		saveButton.textContent = "保存";
		saveButton.addEventListener("click", () => {
			const description = input.value.trim();
			if (description) {
				const priority = prioritySelect.value || undefined;
				this.onSave(description, priority);
				this.close();
			}
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
