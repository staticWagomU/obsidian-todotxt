/**
 * EditTaskModal - タスク編集モーダル
 */

import { type App } from "obsidian";
import { BaseTaskModal } from "./BaseTaskModal";
import { generatePriorityOptions } from "../lib/priority-options";
import type { Todo } from "../lib/todo";

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
	todos: Todo[];

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
		todos: Todo[] = [],
	) {
		super(app);
		this.initialDescription = initialDescription;
		this.initialPriority = initialPriority;
		this.initialDueDate = initialDueDate;
		this.initialThresholdDate = initialThresholdDate;
		this.todos = todos;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;

		// 初期値からプロジェクト/コンテキストを抽出
		const initialProjects = this.extractProjectsFromDescription(this.initialDescription);
		const initialContexts = this.extractContextsFromDescription(this.initialDescription);
		// 説明文からプロジェクト/コンテキストを除去した純粋なテキスト
		const pureDescription = this.removeProjectsContextsFromDescription(this.initialDescription);

		// === Header Row: タスク + 優先度 ===
		const headerRow = contentEl.createEl("div", { cls: "modal-header-row" });

		// Task description field
		const taskField = headerRow.createEl("div", { cls: "modal-task-field" });
		taskField.createEl("label", { text: "タスク" });
		const input = taskField.createEl("input");
		input.type = "text";
		input.classList.add("task-description-input");
		input.placeholder = "タスクを入力...";
		input.value = pureDescription;

		// Priority field
		const priorityField = headerRow.createEl("div", { cls: "modal-priority-field" });
		priorityField.createEl("label", { text: "優先度" });
		const prioritySelect = priorityField.createEl("select");
		prioritySelect.classList.add("priority-select");
		const priorityOptions = generatePriorityOptions();
		for (const option of priorityOptions) {
			const optionEl = prioritySelect.createEl("option");
			optionEl.textContent = option.label;
			optionEl.value = option.value ?? "";
		}
		prioritySelect.value = this.initialPriority ?? "";

		// === Date Row: 期限日 + 開始日 ===
		const dateRow = contentEl.createEl("div", { cls: "modal-date-row" });

		// Due date field
		const dueDateField = dateRow.createEl("div", { cls: "modal-date-field" });
		dueDateField.createEl("label", { text: "期限日 (due:)" });
		const dueDateInput = dueDateField.createEl("input");
		dueDateInput.type = "date";
		dueDateInput.classList.add("due-date-input");
		dueDateInput.value = this.initialDueDate ?? "";

		// Threshold date field
		const thresholdField = dateRow.createEl("div", { cls: "modal-date-field" });
		thresholdField.createEl("label", { text: "開始日 (t:)" });
		const thresholdDateInput = thresholdField.createEl("input");
		thresholdDateInput.type = "date";
		thresholdDateInput.classList.add("threshold-date-input");
		thresholdDateInput.value = this.initialThresholdDate ?? "";

		// === Tags Row: プロジェクト + コンテキスト (チップUI) ===
		const { projectChipInput, contextChipInput } = this.createProjectContextChipsRow(
			contentEl,
			this.todos,
			initialProjects,
			initialContexts,
			() => updatePreviewContent(),
		);

		// Preview area
		this.createPreviewArea(contentEl);

		// プレビュー更新関数
		const updatePreviewContent = (): void => {
			const baseDescription = input.value.trim();
			const projects = projectChipInput.getValues();
			const contexts = contextChipInput.getValues();
			const fullDescription = this.buildDescriptionWithProjectsContexts(
				baseDescription,
				projects,
				contexts,
			);
			const priority = prioritySelect.value || undefined;
			const dueDate = dueDateInput.value || undefined;
			const thresholdDate = thresholdDateInput.value || undefined;

			this.updatePreviewFromFormValues(contentEl, fullDescription, priority, dueDate, thresholdDate);
		};

		// Add event listeners for real-time preview
		input.addEventListener("input", updatePreviewContent);
		prioritySelect.addEventListener("change", updatePreviewContent);
		dueDateInput.addEventListener("change", updatePreviewContent);
		thresholdDateInput.addEventListener("change", updatePreviewContent);

		// Initial preview update
		updatePreviewContent();

		// Save button
		const saveButton = contentEl.createEl("button");
		saveButton.classList.add("save-task-button");
		saveButton.textContent = "保存";
		saveButton.addEventListener("click", () => {
			const baseDescription = input.value.trim();
			if (baseDescription) {
				const projects = projectChipInput.getValues();
				const contexts = contextChipInput.getValues();
				const fullDescription = this.buildDescriptionWithProjectsContexts(
					baseDescription,
					projects,
					contexts,
				);
				const priority = prioritySelect.value || undefined;
				const dueDate = dueDateInput.value || undefined;
				const thresholdDate = thresholdDateInput.value || undefined;
				this.onSave(fullDescription, priority, dueDate, thresholdDate);
				this.close();
			}
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	// ========================================
	// プロジェクト/コンテキスト抽出・構築ヘルパー
	// ========================================

	/**
	 * description からプロジェクトを抽出
	 * @param description タスク説明文
	 * @returns プロジェクト名の配列（プレフィックスなし）
	 */
	private extractProjectsFromDescription(description: string): string[] {
		const matches = description.matchAll(/\+(\S+)/g);
		return Array.from(matches, (m) => m[1] ?? "").filter(Boolean);
	}

	/**
	 * description からコンテキストを抽出
	 * @param description タスク説明文
	 * @returns コンテキスト名の配列（プレフィックスなし）
	 */
	private extractContextsFromDescription(description: string): string[] {
		const matches = description.matchAll(/@(\S+)/g);
		return Array.from(matches, (m) => m[1] ?? "").filter(Boolean);
	}

	/**
	 * description からプロジェクト/コンテキストを除去
	 * @param description タスク説明文
	 * @returns プロジェクト/コンテキストを除去した説明文
	 */
	private removeProjectsContextsFromDescription(description: string): string {
		return description
			.replace(/\s*\+\S+/g, "")
			.replace(/\s*@\S+/g, "")
			.trim();
	}

	/**
	 * プロジェクト/コンテキストを description に追加
	 * @param baseDescription 基本の説明文
	 * @param projects プロジェクト配列
	 * @param contexts コンテキスト配列
	 * @returns 完全な説明文
	 */
	private buildDescriptionWithProjectsContexts(
		baseDescription: string,
		projects: string[],
		contexts: string[],
	): string {
		let result = baseDescription;

		for (const project of projects) {
			result += ` +${project}`;
		}
		for (const context of contexts) {
			result += ` @${context}`;
		}

		return result;
	}
}
