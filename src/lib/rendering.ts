import { type Todo } from "./todo";
import { parseTodoTxt } from "./parser";
import { getDueDateFromTodo, getDueDateStyle } from "./due";
import { getThresholdDateStyle } from "./threshold";

/**
 * Render task list in contentEl
 */
export function renderTaskList(
	contentEl: HTMLElement,
	data: string,
	onAddTask: () => void,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
): void {
	contentEl.empty();

	// Add task button
	renderAddButton(contentEl, onAddTask);

	const ul = contentEl.createEl("ul");

	const todos = parseTodoTxt(data);
	const today = new Date(); // Get current date once for all todos

	for (let index = 0; index < todos.length; index++) {
		const todo = todos[index];
		if (!todo) continue;

		renderTaskItem(ul, todo, index, today, onToggle, onEdit, onDelete);
	}
}

/**
 * Render add task button
 */
function renderAddButton(contentEl: HTMLElement, onAddTask: () => void): void {
	const addButton = contentEl.createEl("button");
	addButton.classList.add("add-task-button");
	addButton.textContent = "+";
	addButton.addEventListener("click", () => {
		onAddTask();
	});
}

/**
 * Render single task item
 */
function renderTaskItem(
	ul: HTMLUListElement,
	todo: Todo,
	index: number,
	today: Date,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
): void {
	const li = ul.createEl("li");

	// Apply threshold date grayout style if t: tag exists
	const thresholdStyle = getThresholdDateStyle(todo, today);
	Object.assign(li.style, thresholdStyle);

	// Add checkbox
	const checkbox = li.createEl("input");
	checkbox.type = "checkbox";
	checkbox.classList.add("task-checkbox");
	checkbox.checked = todo.completed;
	checkbox.dataset.index = String(index);

	// Add click handler
	checkbox.addEventListener("click", () => {
		void onToggle(index);
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
		const dueDateStyle = getDueDateStyle(dueDate, today);
		Object.assign(dueBadge.style, dueDateStyle);
	}

	// Add edit button
	const editButton = li.createEl("button");
	editButton.classList.add("edit-task-button");
	editButton.textContent = "編集";
	editButton.dataset.index = String(index);
	editButton.addEventListener("click", () => {
		onEdit(index);
	});

	// Add delete button
	const deleteButton = li.createEl("button");
	deleteButton.classList.add("delete-task-button");
	deleteButton.textContent = "削除";
	deleteButton.dataset.index = String(index);
	deleteButton.addEventListener("click", () => {
		void onDelete(index);
	});

	if (todo.completed) {
		li.classList.add("completed");
	}
}
