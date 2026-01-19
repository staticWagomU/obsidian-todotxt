/**
 * SaveFilterModal - フィルター保存モーダル
 * 現在のフィルター状態を名前を付けて保存するためのダイアログ
 */

import { Modal, type App } from "obsidian";
import type { FilterState } from "../lib/rendering";

export interface SaveFilterModalOptions {
	filterState: FilterState;
	onSave: (name: string, filterState: FilterState) => void;
	existingPresetNames: string[];
}

interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Modal for saving the current filter state as a named preset
 */
export class SaveFilterModal extends Modal {
	filterState: FilterState;
	onSaveCallback: (name: string, filterState: FilterState) => void;
	existingPresetNames: string[];

	private nameInput: HTMLInputElement | null = null;
	private errorEl: HTMLElement | null = null;

	constructor(app: App, options: SaveFilterModalOptions) {
		super(app);
		this.filterState = options.filterState;
		this.onSaveCallback = options.onSave;
		this.existingPresetNames = options.existingPresetNames;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "フィルターを保存" });

		// Filter summary section
		const summaryContainer = contentEl.createEl("div", { cls: "filter-summary-container" });
		summaryContainer.createEl("p", { cls: "filter-summary-label", text: "保存するフィルター:" });
		const summaryEl = summaryContainer.createEl("div", { cls: "filter-summary" });
		summaryEl.innerHTML = this.getFilterSummary().replace(/\n/g, "<br>");

		// Name input section
		const nameContainer = contentEl.createEl("div", { cls: "filter-name-container" });
		nameContainer.createEl("label", { text: "プリセット名" });
		this.nameInput = nameContainer.createEl("input", {
			type: "text",
			cls: "filter-name-input",
			placeholder: "フィルター名を入力...",
		});

		// Error message container
		this.errorEl = nameContainer.createEl("div", { cls: "filter-name-error", text: "" });

		// Button container
		const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });

		const saveButton = buttonContainer.createEl("button", { text: "保存", cls: "mod-cta" });
		saveButton.addEventListener("click", () => {
			this.handleSave();
		});

		const cancelButton = buttonContainer.createEl("button", { text: "キャンセル" });
		cancelButton.addEventListener("click", () => {
			this.close();
		});

		// Enter key to save
		this.nameInput.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				this.handleSave();
			}
		});

		// Focus on input
		this.nameInput.focus();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Handle save button click
	 */
	private handleSave(): void {
		if (!this.nameInput) return;

		const name = this.nameInput.value;
		const validation = this.validateName(name);

		if (!validation.valid) {
			this.showError(validation.error || "入力エラー");
			return;
		}

		this.triggerSave(name);
		this.close();
	}

	/**
	 * Show error message
	 */
	private showError(message: string): void {
		if (this.errorEl) {
			this.errorEl.textContent = message;
			this.errorEl.classList.add("is-visible");
		}
	}

	/**
	 * Validate the preset name
	 */
	validateName(name: string): ValidationResult {
		const trimmedName = name.trim();

		if (trimmedName === "") {
			return { valid: false, error: "名前を入力してください" };
		}

		const isDuplicate = this.existingPresetNames.some(
			(existing) => existing.toLowerCase() === trimmedName.toLowerCase()
		);
		if (isDuplicate) {
			return { valid: false, error: "この名前は既に使用されています" };
		}

		return { valid: true };
	}

	/**
	 * Trigger the save callback with the name and filter state
	 */
	triggerSave(name: string): void {
		const trimmedName = name.trim();
		this.onSaveCallback(trimmedName, this.filterState);
	}

	/**
	 * Get a formatted summary of the filter state for display
	 */
	getFilterSummary(): string {
		const lines: string[] = [];

		// Priority
		const priorityLabel = this.filterState.priority === "all"
			? "全て"
			: this.filterState.priority === "none"
				? "優先度なし"
				: this.filterState.priority;
		lines.push(`優先度: ${priorityLabel}`);

		// Search
		const searchLabel = this.filterState.search || "(なし)";
		lines.push(`検索: ${searchLabel}`);

		// Group
		const groupLabels: Record<string, string> = {
			none: "なし",
			project: "プロジェクト",
			context: "コンテキスト",
			priority: "優先度",
		};
		const groupLabel = groupLabels[this.filterState.group] || this.filterState.group;
		lines.push(`グループ: ${groupLabel}`);

		// Sort
		const sortLabels: Record<string, string> = {
			default: "デフォルト",
			completion: "未完了→完了",
		};
		const sortLabel = sortLabels[this.filterState.sort] || this.filterState.sort;
		lines.push(`ソート: ${sortLabel}`);

		// Status
		const statusLabels: Record<string, string> = {
			all: "全て",
			active: "未完了",
			completed: "完了",
		};
		const statusLabel = statusLabels[this.filterState.status] || this.filterState.status;
		lines.push(`ステータス: ${statusLabel}`);

		return lines.join("\n");
	}
}
