/**
 * EditTaskModal - タスク編集モーダル
 */

import { type App } from "obsidian";
import { BaseTaskModal } from "./BaseTaskModal";
import { generatePriorityOptions } from "../lib/priority-options";

export class EditTaskModal extends BaseTaskModal {
	onSave: (
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	) => void;
	initialDescription: string;
	initialPriority?: string;
	initialDueDate?: string;
	initialThresholdDate?: string;

	constructor(
		app: App,
		initialDescription: string,
		onSave: (
			description: string,
			priority?: string,
			dueDate?: string,
			thresholdDate?: string,
		) => void,
		initialPriority?: string,
		initialDueDate?: string,
		initialThresholdDate?: string,
	) {
		super(app);
		this.initialDescription = initialDescription;
		this.initialPriority = initialPriority;
		this.initialDueDate = initialDueDate;
		this.initialThresholdDate = initialThresholdDate;
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
		input.value = this.initialDescription;

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
		// Set initial priority selection
		prioritySelect.value = this.initialPriority ?? "";

		// Due date input
		this.createLabel(contentEl, "期限日 (due:)");
		const dueDateInput = contentEl.createEl("input");
		dueDateInput.type = "date";
		dueDateInput.classList.add("due-date-input");
		dueDateInput.value = this.initialDueDate ?? "";

		// Threshold date input
		this.createLabel(contentEl, "開始日 (t:)");
		const thresholdDateInput = contentEl.createEl("input");
		thresholdDateInput.type = "date";
		thresholdDateInput.classList.add("threshold-date-input");
		thresholdDateInput.value = this.initialThresholdDate ?? "";

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

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
