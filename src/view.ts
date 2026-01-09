import { TextFileView, type TFile, type WorkspaceLeaf } from "obsidian";
import { parseTodoTxt, updateTodoInList } from "./lib/parser";
import { toggleCompletion, createAndAppendTask, editAndUpdateTask, deleteAndRemoveTask, type Todo } from "./lib/todo";

export const VIEW_TYPE_TODOTXT = "todotxt-view";

export class TodotxtView extends TextFileView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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

	setViewData(data: string, clear: boolean): void {
		this.data = data;
		if (clear) {
			this.clear();
		}
	}

	clear(): void {
		this.data = "";
	}

	/**
	 * Get toggle handler for task completion status
	 */
	getToggleHandler(): (index: number) => Promise<void> {
		return async (index: number) => {
			const todos = parseTodoTxt(this.data);

			if (index < 0 || index >= todos.length) {
				return;
			}

			const todo = todos[index];
			if (!todo) {
				return;
			}

			const result = toggleCompletion(todo);
			let updatedData = updateTodoInList(todos, index, result.originalTask);

			// If recurring task was created, append it
			if (result.recurringTask) {
				const updatedTodos = parseTodoTxt(updatedData);
				updatedTodos.push(result.recurringTask);
				updatedData = updatedTodos.map(t => t.raw).join('\n');
			}

			this.setViewData(updatedData, false);
		};
	}

	/**
	 * Get add handler for creating new tasks
	 */
	getAddHandler(): (description: string, priority?: string) => Promise<void> {
		return async (description: string, priority?: string) => {
			const currentData = this.data;
			const updatedData = createAndAppendTask(currentData, description, priority);

			this.setViewData(updatedData, false);
		};
	}

	/**
	 * Get edit handler for editing existing tasks
	 */
	getEditHandler(): (
		lineIndex: number,
		updates: Partial<Pick<Todo, "description" | "priority">>,
	) => Promise<void> {
		return async (
			lineIndex: number,
			updates: Partial<Pick<Todo, "description" | "priority">>,
		) => {
			const currentData = this.data;
			const updatedData = editAndUpdateTask(currentData, lineIndex, updates);

			this.setViewData(updatedData, false);
		};
	}

	/**
	 * Get delete handler for deleting tasks
	 */
	getDeleteHandler(): (index: number) => Promise<void> {
		return async (index: number) => {
			const currentData = this.data;
			const updatedData = deleteAndRemoveTask(currentData, index);

			this.setViewData(updatedData, false);
		};
	}

	/**
	 * Render task list in contentEl
	 */
	renderTaskList(): void {
		this.contentEl.empty();
		const ul = this.contentEl.createEl("ul");

		const todos = parseTodoTxt(this.data);
		for (const todo of todos) {
			const li = ul.createEl("li");
			li.textContent = todo.description;

			if (todo.completed) {
				li.classList.add("completed");
			}
		}
	}
}
