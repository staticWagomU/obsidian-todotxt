import { TextFileView, TFile, type WorkspaceLeaf, Modal, type App, Notice } from "obsidian";
import { parseTodoTxt, appendTaskToFile, updateTaskAtLine } from "./lib/parser";
import { type Todo, duplicateTask, editTask } from "./lib/todo";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import { FocusViewModal } from "./ui/FocusViewModal";
import { TemplateSelectModal } from "./ui/TemplateSelectModal";
import { AITaskInputDialog } from "./ui/dialogs/AITaskInputDialog";
import { AIEditDialog } from "./ui/dialogs/AIEditDialog";
import { getToggleHandler, getAddHandler, getEditHandler, getDeleteHandler, getArchiveHandler, getUndoHandler, getRedoHandler } from "./lib/handlers";
import { renderTaskList, type DefaultFilterSettings, type FilterState } from "./lib/rendering";
import { getDefaultFilterForFile } from "./settings";
import { InlineEditState } from "./lib/inline-edit";
import { UndoRedoHistory, createSnapshot } from "./lib/undo-redo";
import { TaskContextMenu, type ContextMenuCallbacks } from "./ui/TaskContextMenu";
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
		await super.onLoadFile(file);

		// Apply default filter for this file if one is set (AC5)
		this.applyDefaultFilterForFile(file.path);
	}

	/**
	 * Apply default filter for a specific file if one is configured
	 */
	private applyDefaultFilterForFile(filePath: string): void {
		const defaultFilterState = getDefaultFilterForFile(this.plugin.settings, filePath);
		if (defaultFilterState) {
			// Defer filter application to after initial render
			setTimeout(() => {
				this.applyPresetFilterState(defaultFilterState);
			}, 0);
		}
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
		const priorityFilter = this.contentEl.querySelector<HTMLSelectElement>("select.priority-filter");
		const searchBox = this.contentEl.querySelector<HTMLInputElement>("input.search-box");
		const groupSelector = this.contentEl.querySelector<HTMLSelectElement>("select.group-selector");
		const sortSelector = this.contentEl.querySelector<HTMLSelectElement>("select.sort-selector");
		const statusFilter = this.contentEl.querySelector<HTMLSelectElement>("select.status-filter");

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
	 * Open focus view modal (PBI-065 AC6, AC7)
	 * Shows today's tasks filtered by due:/t: today or earlier
	 * Public for testing compatibility
	 */
	openFocusViewModal(): void {
		const todos = parseTodoTxt(this.data);
		const toggleHandler = getToggleHandler(() => this.data, (data, clear) => this.setViewDataWithSnapshot(data, clear));

		const modal = new FocusViewModal(this.app, {
			todos,
			onToggleComplete: (_todo, originalIndex) => {
				void toggleHandler(originalIndex);
			},
		});
		modal.open();
	}

	/**
	 * Open template select modal (PBI-066 AC2)
	 * Shows list of templates to select from
	 * Public for testing compatibility
	 */
	openTemplateSelectModal(): void {
		const templates = this.plugin.settings.taskTemplates;

		if (templates.length === 0) {
			new Notice("テンプレートが登録されていません。設定画面でテンプレートを登録してください。");
			return;
		}

		const modal = new TemplateSelectModal(
			this.app,
			templates,
			(taskLines) => {
				if (taskLines.length > 0) {
					// Add each task line to the file
					const newData = this.data.trimEnd() + "\n" + taskLines.join("\n");
					this.setViewDataWithSnapshot(newData, false);
					new Notice(`${taskLines.length}個のタスクを追加しました`);
				}
			}
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

	// ================================
	// Context Menu Methods (Sprint 63 - PBI-061)
	// ================================

	/**
	 * Show context menu at specified position
	 * Sprint 63 - PBI-061: AC1, AC5対応
	 * Public for testing compatibility
	 */
	showContextMenu(index: number, position: { x: number; y: number }): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		// Collect all projects and contexts for submenu options
		const allProjects = this.collectAllProjects(todos);
		const allContexts = this.collectAllContexts(todos);

		const callbacks = this.getContextMenuCallbacks();
		const menu = new TaskContextMenu(todo, index, callbacks, allProjects, allContexts);
		menu.showAtPosition(position);
	}

	/**
	 * Get context menu callbacks
	 * Sprint 63 - PBI-061: AC2, AC3, AC4対応
	 * Public for testing compatibility
	 */
	getContextMenuCallbacks(): ContextMenuCallbacks {
		return {
			onEdit: (index) => this.openEditTaskModal(index),
			onDelete: async (index) => {
				const deleteHandler = this.getDeleteHandler();
				await deleteHandler(index);
			},
			onDuplicate: (index) => this.handleDuplicateTask(index),
			onPriorityChange: (index, priority) => this.handlePriorityChange(index, priority),
			onProjectChange: (index, project, action) => this.handleProjectChange(index, project, action),
			onContextChange: (index, context, action) => this.handleContextChange(index, context, action),
		};
	}

	/**
	 * Handle task duplication
	 * Sprint 63 - PBI-061: AC2対応
	 * Public for testing compatibility
	 */
	handleDuplicateTask(index: number): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		const duplicated = duplicateTask(todo);
		const newData = appendTaskToFile(this.data, duplicated);
		this.setViewDataWithSnapshot(newData, false);
	}

	/**
	 * Handle priority change
	 * Sprint 63 - PBI-061: AC3対応
	 * Public for testing compatibility
	 */
	handlePriorityChange(index: number, priority: string | undefined): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		const updated = editTask(todo, { priority });
		const newData = updateTaskAtLine(this.data, index, updated);
		this.setViewDataWithSnapshot(newData, false);
	}

	/**
	 * Handle project change (add or remove)
	 * Sprint 63 - PBI-061: AC4対応
	 * Public for testing compatibility
	 */
	handleProjectChange(index: number, project: string, action: "add" | "remove"): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		let newDescription = todo.description;
		if (action === "add") {
			// Add project tag if not already present
			if (!todo.projects.includes(project)) {
				newDescription = `${todo.description} +${project}`;
			}
		} else {
			// Remove project tag
			newDescription = todo.description.replace(new RegExp(`\\s*\\+${project}(?=\\s|$)`, "g"), "");
		}

		const updated = editTask(todo, { description: newDescription });
		const newData = updateTaskAtLine(this.data, index, updated);
		this.setViewDataWithSnapshot(newData, false);
	}

	/**
	 * Handle context change (add or remove)
	 * Sprint 63 - PBI-061: AC4対応
	 * Public for testing compatibility
	 */
	handleContextChange(index: number, context: string, action: "add" | "remove"): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		let newDescription = todo.description;
		if (action === "add") {
			// Add context tag if not already present
			if (!todo.contexts.includes(context)) {
				newDescription = `${todo.description} @${context}`;
			}
		} else {
			// Remove context tag
			newDescription = todo.description.replace(new RegExp(`\\s*@${context}(?=\\s|$)`, "g"), "");
		}

		const updated = editTask(todo, { description: newDescription });
		const newData = updateTaskAtLine(this.data, index, updated);
		this.setViewDataWithSnapshot(newData, false);
	}

	/**
	 * Collect all unique projects from todos
	 * Public for testing compatibility
	 */
	collectAllProjects(todos: Todo[]): string[] {
		const projects = new Set<string>();
		for (const todo of todos) {
			for (const project of todo.projects) {
				projects.add(project);
			}
		}
		return Array.from(projects).sort();
	}

	/**
	 * Collect all unique contexts from todos
	 * Public for testing compatibility
	 */
	collectAllContexts(todos: Todo[]): string[] {
		const contexts = new Set<string>();
		for (const todo of todos) {
			for (const context of todo.contexts) {
				contexts.add(context);
			}
		}
		return Array.from(contexts).sort();
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
