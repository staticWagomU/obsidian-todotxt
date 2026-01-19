/**
 * ManageFiltersModal - フィルター管理モーダル
 * 保存されたフィルタープリセットの一覧表示、編集、削除、適用を行うダイアログ
 */

import { Modal, type App } from "obsidian";
import type { FilterPreset } from "../lib/filter-preset";
import type { FilterState } from "../lib/rendering";

export interface ManageFiltersModalOptions {
	presets: FilterPreset[];
	onUpdate: (presetId: string, newName: string) => void;
	onDelete: (presetId: string) => void;
	onApply: (filterState: FilterState) => void;
	onSetDefault: (presetId: string | undefined, filePath: string) => void;
	currentFilePath: string;
	currentDefaultPresetId?: string;
}

interface ValidationResult {
	valid: boolean;
	error?: string;
}

interface PresetListItem {
	id: string;
	name: string;
	filterState: FilterState;
}

/**
 * Modal for managing saved filter presets
 */
export class ManageFiltersModal extends Modal {
	presets: FilterPreset[];
	onUpdateCallback: (presetId: string, newName: string) => void;
	onDeleteCallback: (presetId: string) => void;
	onApplyCallback: (filterState: FilterState) => void;
	onSetDefaultCallback: (presetId: string | undefined, filePath: string) => void;
	currentFilePath: string;
	currentDefaultPresetId?: string;

	constructor(app: App, options: ManageFiltersModalOptions) {
		super(app);
		this.presets = options.presets;
		this.onUpdateCallback = options.onUpdate;
		this.onDeleteCallback = options.onDelete;
		this.onApplyCallback = options.onApply;
		this.onSetDefaultCallback = options.onSetDefault;
		this.currentFilePath = options.currentFilePath;
		this.currentDefaultPresetId = options.currentDefaultPresetId;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "フィルターの管理" });

		if (this.presets.length === 0) {
			contentEl.createEl("p", {
				text: "保存されたフィルターはありません。",
				cls: "filter-manage-empty",
			});
		} else {
			const listContainer = contentEl.createEl("div", { cls: "filter-manage-list" });

			for (const preset of this.presets) {
				this.renderPresetItem(listContainer, preset);
			}
		}

		// Close button
		const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
		const closeButton = buttonContainer.createEl("button", { text: "閉じる" });
		closeButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Render a single preset item in the list
	 */
	private renderPresetItem(container: HTMLElement, preset: FilterPreset): void {
		const itemEl = container.createEl("div", { cls: "filter-manage-item" });

		// Mark as default if applicable
		if (this.isDefaultPreset(preset.id)) {
			itemEl.classList.add("is-default");
		}

		// Name section (editable)
		const nameSection = itemEl.createEl("div", { cls: "filter-manage-name-section" });
		const nameEl = nameSection.createEl("span", {
			text: preset.name,
			cls: "filter-manage-name",
		});
		if (this.isDefaultPreset(preset.id)) {
			nameSection.createEl("span", { text: "(デフォルト)", cls: "filter-manage-default-badge" });
		}

		// Actions section
		const actionsSection = itemEl.createEl("div", { cls: "filter-manage-actions" });

		// Apply button
		const applyButton = actionsSection.createEl("button", { text: "適用", cls: "filter-manage-apply" });
		applyButton.addEventListener("click", () => {
			this.triggerApply(preset.id);
			this.close();
		});

		// Set as default button
		const defaultButton = actionsSection.createEl("button", {
			text: this.isDefaultPreset(preset.id) ? "デフォルト解除" : "デフォルトに設定",
			cls: "filter-manage-default",
		});
		defaultButton.addEventListener("click", () => {
			if (this.isDefaultPreset(preset.id)) {
				this.triggerClearDefault();
			} else {
				this.triggerSetDefault(preset.id);
			}
			this.close();
		});

		// Edit button
		const editButton = actionsSection.createEl("button", { text: "編集", cls: "filter-manage-edit" });
		editButton.addEventListener("click", () => {
			this.showEditInput(itemEl, preset, nameEl);
		});

		// Delete button
		const deleteButton = actionsSection.createEl("button", { text: "削除", cls: "filter-manage-delete" });
		deleteButton.addEventListener("click", () => {
			this.triggerDelete(preset.id);
			itemEl.remove();
		});
	}

	/**
	 * Show inline edit input for preset name
	 */
	private showEditInput(itemEl: HTMLElement, preset: FilterPreset, nameEl: HTMLElement): void {
		const nameSection = itemEl.querySelector(".filter-manage-name-section");
		if (!nameSection) return;

		// Hide name element
		nameEl.style.display = "none";

		// Create edit input
		const editInput = nameSection.createEl("input", {
			type: "text",
			cls: "filter-manage-edit-input",
		});
		editInput.value = preset.name;

		// Error element
		const errorEl = nameSection.createEl("span", { cls: "filter-manage-edit-error" });

		// Save button
		const saveButton = nameSection.createEl("button", { text: "保存", cls: "filter-manage-save" });

		const handleSave = (): void => {
			const newName = editInput.value.trim();
			const validation = this.validateName(newName, preset.id);

			if (!validation.valid) {
				errorEl.textContent = validation.error || "";
				errorEl.classList.add("is-visible");
				return;
			}

			this.triggerUpdate(preset.id, newName);
			nameEl.textContent = newName;
			nameEl.style.display = "";
			editInput.remove();
			saveButton.remove();
			errorEl.remove();
		};

		saveButton.addEventListener("click", handleSave);
		editInput.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				handleSave();
			} else if (event.key === "Escape") {
				nameEl.style.display = "";
				editInput.remove();
				saveButton.remove();
				errorEl.remove();
			}
		});

		editInput.focus();
		editInput.select();
	}

	/**
	 * Get list of presets for display
	 */
	getPresetList(): PresetListItem[] {
		return this.presets.map((preset) => ({
			id: preset.id,
			name: preset.name,
			filterState: preset.filterState,
		}));
	}

	/**
	 * Validate preset name for update
	 */
	validateName(name: string, currentPresetId: string): ValidationResult {
		const trimmedName = name.trim();

		if (trimmedName === "") {
			return { valid: false, error: "名前を入力してください" };
		}

		// Check for duplicates (excluding current preset)
		const isDuplicate = this.presets.some(
			(preset) =>
				preset.id !== currentPresetId &&
				preset.name.toLowerCase() === trimmedName.toLowerCase()
		);
		if (isDuplicate) {
			return { valid: false, error: "この名前は既に使用されています" };
		}

		return { valid: true };
	}

	/**
	 * Check if a preset is the default for current file
	 */
	isDefaultPreset(presetId: string): boolean {
		return this.currentDefaultPresetId === presetId;
	}

	/**
	 * Trigger update callback
	 */
	triggerUpdate(presetId: string, newName: string): void {
		this.onUpdateCallback(presetId, newName);
	}

	/**
	 * Trigger delete callback
	 */
	triggerDelete(presetId: string): void {
		this.onDeleteCallback(presetId);
	}

	/**
	 * Trigger apply callback
	 */
	triggerApply(presetId: string): void {
		const preset = this.presets.find((p) => p.id === presetId);
		if (preset) {
			this.onApplyCallback(preset.filterState);
		}
	}

	/**
	 * Trigger set default callback
	 */
	triggerSetDefault(presetId: string): void {
		this.onSetDefaultCallback(presetId, this.currentFilePath);
	}

	/**
	 * Trigger clear default callback
	 */
	triggerClearDefault(): void {
		this.onSetDefaultCallback(undefined, this.currentFilePath);
	}
}
