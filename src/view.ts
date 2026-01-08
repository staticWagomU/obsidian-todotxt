import { TextFileView, type TFile, type WorkspaceLeaf } from "obsidian";
import { parseTodoTxt, updateTodoInList } from "./lib/parser";
import { toggleCompletion } from "./lib/todo";

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

			const toggledTodo = toggleCompletion(todo);
			const updatedData = updateTodoInList(todos, index, toggledTodo);

			this.setViewData(updatedData, false);
		};
	}
}
