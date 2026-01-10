/**
 * AddTaskModal - タスク追加モーダル
 */

import { Modal, type App } from "obsidian";
import { generatePriorityOptions } from "../lib/priority-options";

export class AddTaskModal extends Modal {
	onSave: (
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	) => void;

	constructor(
		app: App,
		onSave: (
			description: string,
			priority?: string,
			dueDate?: string,
			thresholdDate?: string,
		) => void,
	) {
		super(app);
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;

		// Task description input
		this.createLabel(contentEl, "タスク");
		const input = contentEl.createEl("input");
		input.type = "text";
		input.classList.add("task-description-input");
		input.placeholder = "タスクを入力...";

		// Priority select
		this.createLabel(contentEl, "優先度");
		const prioritySelect = contentEl.createEl("select");
		prioritySelect.classList.add("priority-select");
		const priorityOptions = generatePriorityOptions();
		for (const option of priorityOptions) {
			const optionEl = prioritySelect.createEl("option");
			optionEl.textContent = option.label;
			optionEl.value = option.value ?? "";
		}

		// Due date input
		this.createLabel(contentEl, "期限日 (due:)");
		const dueDateInput = contentEl.createEl("input");
		dueDateInput.type = "date";
		dueDateInput.classList.add("due-date-input");

		// Threshold date input
		this.createLabel(contentEl, "開始日 (t:)");
		const thresholdDateInput = contentEl.createEl("input");
		thresholdDateInput.type = "date";
		thresholdDateInput.classList.add("threshold-date-input");

		// Save button
		const saveButton = contentEl.createEl("button");
		saveButton.classList.add("save-task-button");
		saveButton.textContent = "保存";
		saveButton.addEventListener("click", () => {
			const description = input.value.trim();
			if (description) {
				const priority = prioritySelect.value || undefined;
				const dueDate = dueDateInput.value || undefined;
				const thresholdDate = thresholdDateInput.value || undefined;
				this.onSave(description, priority, dueDate, thresholdDate);
				this.close();
			}
		});
	}

	private createLabel(container: HTMLElement, text: string): void {
		const label = container.createEl("label");
		label.textContent = text;
		label.style.display = "block";
		label.style.marginTop = "10px";
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
