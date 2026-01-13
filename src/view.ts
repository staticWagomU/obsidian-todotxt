import { TextFileView, type TFile, type WorkspaceLeaf } from "obsidian";
import { parseTodoTxt } from "./lib/parser";
import { type Todo } from "./lib/todo";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import { getToggleHandler, getAddHandler, getEditHandler, getDeleteHandler } from "./lib/handlers";
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
		);
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
}
