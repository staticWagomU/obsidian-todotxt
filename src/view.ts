import { TextFileView, type TFile, type WorkspaceLeaf } from "obsidian";
import { parseTodoTxt, updateTodoInList } from "./lib/parser";
import { toggleCompletion, createAndAppendTask, editAndUpdateTask, deleteAndRemoveTask, type Todo } from "./lib/todo";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import { getDueDateFromTodo, getDueDateStyle } from "./lib/due";

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
	 * Open add task modal
	 */
	openAddTaskModal(): void {
		const addHandler = this.getAddHandler();
		const modal = new AddTaskModal(this.app, (description, priority) => {
			void addHandler(description, priority);
		});
		modal.open();
	}

	/**
	 * Open edit task modal
	 */
	openEditTaskModal(index: number): void {
		const todos = parseTodoTxt(this.data);
		const todo = todos[index];
		if (!todo) return;

		const editHandler = this.getEditHandler();
		const modal = new EditTaskModal(this.app, todo.description, (description, priority) => {
			void editHandler(index, { description, priority });
		});
		modal.open();
	}

	/**
	 * Render task list in contentEl
	 */
	renderTaskList(): void {
		this.contentEl.empty();

		// Add task button
		const addButton = this.contentEl.createEl("button");
		addButton.classList.add("add-task-button");
		addButton.textContent = "+";
		addButton.addEventListener("click", () => {
			this.openAddTaskModal();
		});

		const ul = this.contentEl.createEl("ul");

		const todos = parseTodoTxt(this.data);
		for (let index = 0; index < todos.length; index++) {
			const todo = todos[index];
			if (!todo) continue;

			const li = ul.createEl("li");

			// Add checkbox
			const checkbox = li.createEl("input");
			checkbox.type = "checkbox";
			checkbox.classList.add("task-checkbox");
			checkbox.checked = todo.completed;
			checkbox.dataset.index = String(index);

			// Add click handler
			checkbox.addEventListener("click", () => {
				const toggleHandler = this.getToggleHandler();
				void toggleHandler(index);
			});

			// Add space after checkbox
			li.appendChild(document.createTextNode(" "));

			// Add priority badge if priority exists
			if (todo.priority) {
				const badge = li.createEl("span");
				badge.classList.add("priority");
				badge.classList.add(`priority-${todo.priority}`);
				badge.textContent = todo.priority;

				// Add space after badge
				li.appendChild(document.createTextNode(" "));
			}

			li.appendChild(document.createTextNode(todo.description));

			// Add due date badge if due: tag exists
			const dueDate = getDueDateFromTodo(todo);
			if (dueDate) {
				// Add space before badge
				li.appendChild(document.createTextNode(" "));

				const dueBadge = li.createEl("span");
				dueBadge.classList.add("due-date");
				dueBadge.textContent = dueDate.toISOString().split("T")[0]!;

				// Apply style based on due date status
				const today = new Date();
				const style = getDueDateStyle(dueDate, today);
				Object.assign(dueBadge.style, style);
			}

			// Add edit button
			const editButton = li.createEl("button");
			editButton.classList.add("edit-task-button");
			editButton.textContent = "編集";
			editButton.dataset.index = String(index);
			editButton.addEventListener("click", () => {
				this.openEditTaskModal(index);
			});

			// Add delete button
			const deleteButton = li.createEl("button");
			deleteButton.classList.add("delete-task-button");
			deleteButton.textContent = "削除";
			deleteButton.dataset.index = String(index);
			deleteButton.addEventListener("click", () => {
				const deleteHandler = this.getDeleteHandler();
				void deleteHandler(index);
			});

			if (todo.completed) {
				li.classList.add("completed");
			}
		}
	}
}
