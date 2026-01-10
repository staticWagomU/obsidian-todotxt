import { type Todo } from "./todo";
import { parseTodoTxt } from "./parser";
import { getDueDateFromTodo, getDueDateStyle } from "./due";
import { getThresholdDateStyle } from "./threshold";
import { filterByPriority } from "./filter";

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
	// Save current filter state before clearing
	const previousPriorityFilter = contentEl.querySelector("select.priority-filter") as HTMLSelectElement | null;
	const previousPriorityValue = previousPriorityFilter?.value || "all";

	contentEl.empty();

	// Add task button
	renderAddButton(contentEl, onAddTask);

	// Add control bar with priority filter
	renderControlBar(contentEl, data, previousPriorityValue, onAddTask, onToggle, onEdit, onDelete);

	const ul = contentEl.createEl("ul");

	const todos = parseTodoTxt(data);

	// Apply priority filter
	let filteredTodos = todos;
	if (previousPriorityValue !== "all") {
		if (previousPriorityValue === "none") {
			filteredTodos = filterByPriority(todos, null);
		} else {
			filteredTodos = filterByPriority(todos, previousPriorityValue);
		}
	}

	const today = new Date(); // Get current date once for all todos

	// Build index mapping: filteredTodo -> original index
	const todoIndexMap = new Map<Todo, number>();
	for (let i = 0; i < todos.length; i++) {
		todoIndexMap.set(todos[i]!, i);
	}

	for (const todo of filteredTodos) {
		const originalIndex = todoIndexMap.get(todo);
		if (originalIndex === undefined) continue;

		renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete);
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
 * Render control bar with filters and sorting options
 */
function renderControlBar(
	contentEl: HTMLElement,
	data: string,
	previousPriorityValue: string,
	onAddTask: () => void,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
): void {
	const controlBar = contentEl.createEl("div");
	controlBar.classList.add("control-bar");

	// Priority filter dropdown
	const priorityFilter = controlBar.createEl("select");
	priorityFilter.classList.add("priority-filter");

	// Add options
	const allOption = priorityFilter.createEl("option");
	allOption.value = "all";
	allOption.textContent = "全て";

	// Add A-Z priority options
	for (let i = 65; i <= 90; i++) {
		const letter = String.fromCharCode(i);
		const option = priorityFilter.createEl("option");
		option.value = letter;
		option.textContent = letter;
	}

	// Add "none" option for tasks without priority
	const noneOption = priorityFilter.createEl("option");
	noneOption.value = "none";
	noneOption.textContent = "優先度なし";

	// Set previously selected value
	priorityFilter.value = previousPriorityValue;

	// Add change event listener to re-render on selection change
	priorityFilter.addEventListener("change", () => {
		renderTaskList(contentEl, data, onAddTask, onToggle, onEdit, onDelete);
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
