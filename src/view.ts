import { TextFileView, TFile, type WorkspaceLeaf, Modal, type App } from "obsidian";
import { parseTodoTxt } from "./lib/parser";
import { type Todo } from "./lib/todo";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import { AITaskInputDialog } from "./ui/dialogs/AITaskInputDialog";
import { AIEditDialog } from "./ui/dialogs/AIEditDialog";
import { getToggleHandler, getAddHandler, getEditHandler, getDeleteHandler, getArchiveHandler, getUndoHandler, getRedoHandler } from "./lib/handlers";
import { renderTaskList, type DefaultFilterSettings, type FilterState } from "./lib/rendering";
import { InlineEditState } from "./lib/inline-edit";
import { UndoRedoHistory, createSnapshot } from "./lib/undo-redo";
import type TodotxtPlugin from "./main";

export const VIEW_TYPE_TODOTXT = "todotxt-view";

export class TodotxtView extends TextFileView {
	plugin: TodotxtPlugin;
	private inlineEditState: InlineEditState;
	private undoRedoHistory: UndoRedoHistory<string>;

	constructor(leaf: WorkspaceLeaf, plugin: TodotxtPlugin) {
		super(leaf);
		this.plugin = plugin;
		// Initialize undo/redo history (AC5: maxSize=20)
		this.undoRedoHistory = new UndoRedoHistory<string>(20);
		// Initialize inline edit state with callbacks
		this.inlineEditState = new InlineEditState({
			onSave: (index, newValue) => {
				void this.handleInlineEditSave(index, newValue);
			},
			onCancel: () => {
				// Just re-render to exit edit mode
				this.renderTaskList();
			},
		});
	}

	getViewType(): string {
		return VIEW_TYPE_TODOTXT;
	}

	getDisplayText(): string {
		return "Todo.txt";
	}

	async onLoadFile(file: TFile): Promise<void> {
		// To be implemented
		await super.onLoadFile(file);
	}

	async onUnloadFile(file: TFile): Promise<void> {
		await super.onUnloadFile(file);
	}

	getViewData(): string {
		return this.data;
	}

	setViewData(data: string, _clear: boolean): void {
		this.data = data;
		// Note: '_clear' parameter is for UI optimization, not data clearing
		// It tells Obsidian whether to clear the DOM before rendering
		this.renderTaskList();
	}

	/**
	 * Set view data with snapshot for undo/redo (AC3)
	 * Saves both current state and new state for proper undo/redo
	 */
	setViewDataWithSnapshot(data: string, clear: boolean): void {
		// Save current state before change (AC3)
		createSnapshot(this.undoRedoHistory, this.data);
		// Save new state after change
		createSnapshot(this.undoRedoHistory, data);
		this.setViewData(data, clear);
	}

	clear(): void {
		// Intentionally empty - data should never be cleared
		// The 'data' field is managed through setViewData only
	}

	/**
	 * Get default filter settings from plugin settings
	 */
	private getDefaultFilterSettings(): DefaultFilterSettings {
		const settings = this.plugin.settings;
		// Map plugin settings to filter settings
		// settings.defaultSortOrder: "completion" | "priority" | "date" | "alphabetical"
		// FilterState.sort: "default" | "completion"
		const sortMapping: Record<string, string> = {
			completion: "completion",
			priority: "default",
			date: "default",
			alphabetical: "default",
		};
		return {
			sort: sortMapping[settings.defaultSortOrder] || "default",
			group: settings.defaultGrouping,
			savedFilters: settings.savedFilters,
			onApplyPreset: (filterState) => this.applyPresetFilterState(filterState),
		};
	}

	/**
	 * Apply a preset filter state to the view
	 * Updates all filter controls and re-renders
	 */
	private applyPresetFilterState(filterState: FilterState): void {
		// Update filter controls in DOM before re-render
		const priorityFilter = this.contentEl.querySelector("select.priority-filter") as HTMLSelectElement | null;
		const searchBox = this.contentEl.querySelector("input.search-box") as HTMLInputElement | null;
		const groupSelector = this.contentEl.querySelector("select.group-selector") as HTMLSelectElement | null;
		const sortSelector = this.contentEl.querySelector("select.sort-selector") as HTMLSelectElement | null;
		const statusFilter = this.contentEl.querySelector("select.status-filter") as HTMLSelectElement | null;

		if (priorityFilter) priorityFilter.value = filterState.priority;
		if (searchBox) searchBox.value = filterState.search;
		if (groupSelector) groupSelector.value = filterState.group;
		if (sortSelector) sortSelector.value = filterState.sort;
		if (statusFilter) statusFilter.value = filterState.status;

		// Re-render task list with new filter state
		this.renderTaskList();
	}

	/**
	 * Render task list in contentEl
	 * Public for testing compatibility
	 */
	renderTaskList(): void {
		renderTaskList(
			this.contentEl,
			this.data,
			() => this.openAddTaskModal(),
			getToggleHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear)),
			(index) => this.openEditTaskModal(index),
			getDeleteHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear)),
			this.getDefaultFilterSettings(),
			() => this.openArchiveWithConfirmation(),
			() => this.openAITaskDialog(),
			(index) => this.openAIEditDialog(index),
			(description) => { void this.getAddHandler()(description); },
		);
	}

	/**
	 * Open AI task input dialog
	 * Public for testing compatibility
	 */
	openAITaskDialog(): void {
		if (!this.file) {
			console.warn("No file associated with this view");
			return;
		}

		const dialog = new AITaskInputDialog(
			this.app,
			this.plugin.settings.openRouter,
			this.file.path,
			() => {
				this.renderTaskList();
			}
		);
		dialog.open();
	}

	/**
	 * Get toggle handler for task completion status
	 * Public for testing compatibility
	 */
	getToggleHandler(): (index: number) => Promise<void> {
		return getToggleHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
	}

	/**
	 * Get add handler for creating new tasks
	 * Public for testing compatibility
	 */
	getAddHandler(): (description: string, priority?: string) => Promise<void> {
		return getAddHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
	}

	/**
	 * Get edit handler for editing existing tasks
	 * Public for testing compatibility
	 */
	getEditHandler(): (
		lineIndex: number,
		updates: Partial<Pick<Todo, "description" | "priority">>,
	) => Promise<void> {
		return getEditHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
	}

	/**
	 * Get delete handler for deleting tasks
	 * Public for testing compatibility
	 */
	getDeleteHandler(): (index: number) => Promise<void> {
		return getDeleteHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
	}

	/**
	 * Open add task modal
	 * Public for testing compatibility
	 */
	openAddTaskModal(): void {
		const addHandler = getAddHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
		const todos = parseTodoTxt(this.data);
		const modal = new AddTaskModal(
			this.app,
			(description, priority, dueDate, thresholdDate) => {
				void addHandler(description, priority, dueDate, thresholdDate);
			},
			todos,
		);
		modal.open();
	}

	/**
	 * Open edit task modal
	 * Public for testing compatibility
	 */
	openEditTaskModal(index: number): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		const editHandler = getEditHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
		const modal = new EditTaskModal(
			this.app,
			todo.description,
			(description, priority, dueDate, thresholdDate) => {
				void editHandler(index, { description, priority, dueDate, thresholdDate });
			},
			todo.priority,
			todo.tags.due,
			todo.tags.t,
			todos,
		);
		modal.open();
	}

	/**
	 * Open AI edit dialog
	 * Public for testing compatibility
	 */
	openAIEditDialog(index: number): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		const dialog = new AIEditDialog(
			this.app,
			todo,
			this.file?.path || "",
			index,
			this.plugin.settings.openRouter,
			() => {
				this.renderTaskList();
			}
		);
		dialog.open();
	}

	/**
	 * Get archive handler for archiving completed tasks
	 * Public for testing compatibility
	 */
	getArchiveHandler(): () => Promise<void> {
		if (!this.file) {
			// Return no-op handler if file is not set
			return async () => {};
		}

		const todoPath = this.file.path;
		const readArchive = async (): Promise<string> => {
			const archivePath = todoPath.replace(/\.(txt|todotxt)$/, '') + '.done.txt';
			const archiveFile = this.app.vault.getAbstractFileByPath(archivePath);
			if (archiveFile instanceof TFile) {
				return await this.app.vault.read(archiveFile);
			}
			return "";
		};

		const writeArchive = async (data: string): Promise<void> => {
			const archivePath = todoPath.replace(/\.(txt|todotxt)$/, '') + '.done.txt';
			const archiveFile = this.app.vault.getAbstractFileByPath(archivePath);
			if (archiveFile instanceof TFile) {
				await this.app.vault.modify(archiveFile, data);
			} else {
				// Create new file
				await this.app.vault.create(archivePath, data);
			}
		};

		return getArchiveHandler(
			() => this.data,
			(data, clear) => this.setViewDataWithSnapshot(data, clear),
			todoPath,
			readArchive,
			writeArchive,
		);
	}

	/**
	 * Show archive confirmation modal
	 * Public for testing compatibility
	 */
	showArchiveConfirmation(): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new ArchiveConfirmationModal(this.app, (confirmed) => {
				resolve(confirmed);
			});
			modal.open();
		});
	}

	/**
	 * Open archive with confirmation modal
	 * Public for testing compatibility
	 */
	async openArchiveWithConfirmation(): Promise<void> {
		const confirmed = await this.showArchiveConfirmation();
		if (confirmed) {
			const archiveHandler = this.getArchiveHandler();
			await archiveHandler();
		}
	}

	/**
	 * Get bulk save handler for updating multiple todos at once
	 * Public for testing compatibility
	 * @returns Handler function that takes selected indices and updated todo lines
	 */
	getHandleBulkSave(): (selectedIndices: number[], updatedTodoLines: string[]) => Promise<void> {
		return async (selectedIndices: number[], updatedTodoLines: string[]): Promise<void> => {
			// Validate: Empty selection does nothing
			if (selectedIndices.length === 0) {
				return;
			}

			// Validate: Index count must match updated lines count
			if (selectedIndices.length !== updatedTodoLines.length) {
				return;
			}

			// Get current data as lines
			const lines = this.data.split("\n");

			// Update each selected line with the corresponding updated todo
			for (let i = 0; i < selectedIndices.length; i++) {
				const lineIndex = selectedIndices[i];
				const updatedLine = updatedTodoLines[i];
				if (lineIndex !== undefined && updatedLine !== undefined && lineIndex < lines.length) {
					lines[lineIndex] = updatedLine;
				}
			}

			// Update data and re-render
			this.setViewData(lines.join("\n"), false);
		};
	}

	/**
	 * Get reset selection mode handler
	 * Resets selection mode to normal mode: hides checkboxes, clears selections
	 * Public for testing compatibility
	 */
	getResetSelectionMode(): () => void {
		return (): void => {
			// Find the batch selection button and deactivate it if active
			const batchButton = this.contentEl.querySelector(".batch-selection-button");
			if (batchButton instanceof HTMLButtonElement && batchButton.classList.contains("active")) {
				// Remove active class to trigger mode reset
				batchButton.classList.remove("active");
				batchButton.textContent = "一括選択";
			}

			// Re-render the task list to reflect the normal mode
			this.renderTaskList();
		};
	}

	/**
	 * Get bulk save handler with automatic selection mode reset
	 * Combines bulk save with selection mode reset after successful save
	 * Public for testing compatibility
	 */
	getHandleBulkSaveWithReset(): (selectedIndices: number[], updatedTodoLines: string[]) => Promise<void> {
		return async (selectedIndices: number[], updatedTodoLines: string[]): Promise<void> => {
			// Perform bulk save
			const bulkSave = this.getHandleBulkSave();
			await bulkSave(selectedIndices, updatedTodoLines);

			// Reset selection mode after successful save
			const resetSelectionMode = this.getResetSelectionMode();
			resetSelectionMode();
		};
	}

	/**
	 * Get inline edit state for testing
	 * Public for testing compatibility
	 */
	getInlineEditState(): InlineEditState {
		return this.inlineEditState;
	}

	/**
	 * Start inline editing for a task
	 * Called when user double-clicks or presses Enter on a task
	 * Public for testing compatibility
	 */
	startInlineEdit(index: number): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		this.inlineEditState.start(index, todo.description);
		// Re-render to show edit input
		this.renderTaskList();
	}

	/**
	 * Handle inline edit save
	 * Updates the task description and re-renders
	 */
	private async handleInlineEditSave(index: number, newValue: string): Promise<void> {
		const editHandler = getEditHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));
		await editHandler(index, { description: newValue });
		// State is already cleared by save() method in InlineEditState
	}

	/**
	 * Handle inline edit cancel
	 * Restores original value and exits edit mode
	 * Public for testing compatibility
	 */
	cancelInlineEdit(): void {
		this.inlineEditState.cancel();
		// onCancel callback will trigger re-render
	}

	/**
	 * Handle inline edit save from UI
	 * Updates current value and saves
	 * Public for testing compatibility
	 */
	saveInlineEdit(newValue: string): void {
		this.inlineEditState.setCurrentValue(newValue);
		this.inlineEditState.save();
		// onSave callback will handle the actual save
	}

	/**
	 * Check if currently in inline edit mode
	 * Public for testing compatibility
	 */
	isInlineEditing(): boolean {
		return this.inlineEditState.isEditing();
	}

	/**
	 * Get the index of the task being edited
	 * Public for testing compatibility
	 */
	getInlineEditingIndex(): number | null {
		return this.inlineEditState.getEditingIndex();
	}

	/**
	 * Get undo/redo history instance
	 * Public for testing compatibility
	 */
	getUndoRedoHistory(): UndoRedoHistory<string> {
		return this.undoRedoHistory;
	}

	/**
	 * Check if undo is possible
	 * Public for testing compatibility
	 */
	canUndo(): boolean {
		return this.undoRedoHistory.canUndo();
	}

	/**
	 * Check if redo is possible
	 * Public for testing compatibility
	 */
	canRedo(): boolean {
		return this.undoRedoHistory.canRedo();
	}

	/**
	 * Undo the last operation (AC1)
	 * Returns true if undo was successful
	 * Public for testing compatibility
	 */
	async undo(): Promise<boolean> {
		const undoHandler = getUndoHandler(this.undoRedoHistory, (data, clear) => this.setViewData(data, clear));
		return await undoHandler();
	}

	/**
	 * Redo the last undone operation (AC2)
	 * Returns true if redo was successful
	 * Public for testing compatibility
	 */
	async redo(): Promise<boolean> {
		const redoHandler = getRedoHandler(this.undoRedoHistory, (data, clear) => this.setViewData(data, clear));
		return await redoHandler();
	}

	/**
	 * Clear undo/redo history
	 * Public for testing compatibility
	 */
	clearHistory(): void {
		this.undoRedoHistory.clear();
	}
}

/**
 * Archive confirmation modal
 */
class ArchiveConfirmationModal extends Modal {
	onConfirm: (confirmed: boolean) => void;

	constructor(app: App, onConfirm: (confirmed: boolean) => void) {
		super(app);
		this.onConfirm = onConfirm;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "完了タスクをアーカイブ" });
		contentEl.createEl("p", { text: "完了したタスクをdone.txtファイルに移動しますか？" });

		const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });

		const confirmButton = buttonContainer.createEl("button", { text: "アーカイブ", cls: "mod-cta" });
		confirmButton.addEventListener("click", () => {
			this.close();
			this.onConfirm(true);
		});

		const cancelButton = buttonContainer.createEl("button", { text: "キャンセル" });
		cancelButton.addEventListener("click", () => {
			this.close();
			this.onConfirm(false);
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
