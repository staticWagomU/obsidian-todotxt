import { TextFileView, TFile, type WorkspaceLeaf, Modal, type App } from "obsidian";
import { parseTodoTxt } from "./lib/parser";
import { type Todo } from "./lib/todo";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import { AITaskInputDialog } from "./ui/dialogs/AITaskInputDialog";
import { AIEditDialog } from "./ui/dialogs/AIEditDialog";
import { getToggleHandler, getAddHandler, getEditHandler, getDeleteHandler, getArchiveHandler } from "./lib/handlers";
import { renderTaskList, type DefaultFilterSettings } from "./lib/rendering";
import type TodotxtPlugin from "./main";

export const VIEW_TYPE_TODOTXT = "todotxt-view";

export class TodotxtView extends TextFileView {
	plugin: TodotxtPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: TodotxtPlugin) {
		super(leaf);
		this.plugin = plugin;
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
		};
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
			getToggleHandler(() => this.data, (data, clear) => this.setViewData(data, clear)),
			(index) => this.openEditTaskModal(index),
			getDeleteHandler(() => this.data, (data, clear) => this.setViewData(data, clear)),
			this.getDefaultFilterSettings(),
			() => this.openArchiveWithConfirmation(),
			() => this.openAITaskDialog(),
			(index) => this.openAIEditDialog(index),
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
		return getToggleHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
	}

	/**
	 * Get add handler for creating new tasks
	 * Public for testing compatibility
	 */
	getAddHandler(): (description: string, priority?: string) => Promise<void> {
		return getAddHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
	}

	/**
	 * Get edit handler for editing existing tasks
	 * Public for testing compatibility
	 */
	getEditHandler(): (
		lineIndex: number,
		updates: Partial<Pick<Todo, "description" | "priority">>,
	) => Promise<void> {
		return getEditHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
	}

	/**
	 * Get delete handler for deleting tasks
	 * Public for testing compatibility
	 */
	getDeleteHandler(): (index: number) => Promise<void> {
		return getDeleteHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
	}

	/**
	 * Open add task modal
	 * Public for testing compatibility
	 */
	openAddTaskModal(): void {
		const addHandler = getAddHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
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

		const editHandler = getEditHandler(() => this.data, (data, clear) => this.setViewData(data, clear));
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
			(data, clear) => this.setViewData(data, clear),
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
