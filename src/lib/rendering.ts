import { type Todo } from "./todo";
import { parseTodoTxt } from "./parser";
import { getDueDateFromTodo, getDueDateStyle } from "./due";
import { getThresholdDateStyle } from "./threshold";
import { filterByPriority, filterBySearch } from "./filter";
import { groupByProject, groupByContext } from "./group";
import { sortTodos } from "./sort";
import { extractInternalLinks } from "./internallink";
import { extractExternalLinks } from "./externallink";

/**
 * LinkHandler interface for abstracting Obsidian API
 * Allows testing without Obsidian app dependency
 */
export interface LinkHandler {
	openInternalLink(link: string): void;
}

/**
 * Filter state for control bar
 */
export interface FilterState {
	priority: string;
	search: string;
	group: string;
	sort: string;
}

/**
 * Default filter state
 */
export const DEFAULT_FILTER_STATE: FilterState = {
	priority: "all",
	search: "",
	group: "none",
	sort: "default",
};

/**
 * Render internal links as clickable elements
 */
export function renderInternalLinks(description: string): HTMLElement[] {
	const links = extractInternalLinks(description);
	return links.map(link => {
		const el = document.createElement("button");
		el.classList.add("internal-link");
		el.textContent = link.alias || link.link;
		el.dataset.link = link.link;
		return el;
	});
}

/**
 * Render external links as clickable anchor elements
 */
export function renderExternalLinks(description: string): HTMLElement[] {
	const links = extractExternalLinks(description);
	return links.map(link => {
		const el = document.createElement("a");
		el.classList.add("external-link");
		el.textContent = link.text;
		el.href = link.url;
		el.target = "_blank";
		el.rel = "noopener noreferrer";
		return el;
	});
}

/**
 * Render recurrence icon if rec: tag exists
 */
export function renderRecurrenceIcon(todo: Todo): HTMLElement | null {
	const recTag = todo.tags.rec;
	if (!recTag) {
		return null;
	}

	// Extract pattern string (remove "rec:" prefix)
	const pattern = recTag.replace(/^rec:/, "");

	const el = document.createElement("span");
	el.classList.add("recurrence-icon");
	el.textContent = "🔁"; // Recurrence icon
	el.setAttribute("aria-label", `繰り返し: ${pattern}`);
	el.setAttribute("title", `繰り返し: ${pattern}`);

	return el;
}

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
	const filterState = saveFilterState(contentEl);

	contentEl.empty();

	// Add task button
	renderAddButton(contentEl, onAddTask);

	// Add control bar with priority filter and search box
	renderControlBar(contentEl, data, filterState, onAddTask, onToggle, onEdit, onDelete);

	const ul = contentEl.createEl("ul");

	const todos = parseTodoTxt(data);

	// Apply filters
	const filteredTodos = applyFilters(todos, filterState);

	const today = new Date(); // Get current date once for all todos

	// Build index mapping: filteredTodo -> original index
	const todoIndexMap = new Map<Todo, number>();
	for (let i = 0; i < todos.length; i++) {
		todoIndexMap.set(todos[i]!, i);
	}

	// Render tasks with grouping if enabled
	if (filterState.group !== "none") {
		renderGroupedTasks(ul, filteredTodos, filterState.group, todoIndexMap, today, onToggle, onEdit, onDelete);
	} else {
		// Render tasks without grouping
		for (const todo of filteredTodos) {
			const originalIndex = todoIndexMap.get(todo);
			if (originalIndex === undefined) continue;

			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete);
		}
	}
}

/**
 * Save current filter state from DOM
 */
function saveFilterState(contentEl: HTMLElement): FilterState {
	const previousPriorityFilter = contentEl.querySelector("select.priority-filter");
	const previousSearchBox = contentEl.querySelector("input.search-box");
	const previousGroupSelector = contentEl.querySelector("select.group-selector");
	const previousSortSelector = contentEl.querySelector("select.sort-selector");

	return {
		priority: (previousPriorityFilter instanceof HTMLSelectElement ? previousPriorityFilter.value : null) || "all",
		search: (previousSearchBox instanceof HTMLInputElement ? previousSearchBox.value : null) || "",
		group: (previousGroupSelector instanceof HTMLSelectElement ? previousGroupSelector.value : null) || "none",
		sort: (previousSortSelector instanceof HTMLSelectElement ? previousSortSelector.value : null) || "default",
	};
}

/**
 * Apply all filters and sorting to todos
 */
function applyFilters(todos: Todo[], filterState: FilterState): Todo[] {
	let filtered = applyPriorityFilter(todos, filterState.priority);
	filtered = filterBySearch(filtered, filterState.search);

	// Apply sorting if enabled
	if (filterState.sort === "completion") {
		filtered = sortTodos(filtered);
	}

	return filtered;
}

/**
 * Apply priority filter to todos
 */
function applyPriorityFilter(todos: Todo[], priorityValue: string): Todo[] {
	if (priorityValue === "all") {
		return todos;
	}
	if (priorityValue === "none") {
		return filterByPriority(todos, null);
	}
	return filterByPriority(todos, priorityValue);
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
	filterState: FilterState,
	onAddTask: () => void,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
): void {
	const controlBar = contentEl.createEl("div");
	controlBar.classList.add("control-bar");

	const onFilterChange = () => renderTaskList(contentEl, data, onAddTask, onToggle, onEdit, onDelete);

	// Render priority filter dropdown
	renderPriorityFilterDropdown(controlBar, filterState.priority, onFilterChange);

	// Render search box
	renderSearchBox(controlBar, filterState.search, onFilterChange);

	// Render group selector
	renderGroupSelector(controlBar, filterState.group, onFilterChange);

	// Render sort selector
	renderSortSelector(controlBar, filterState.sort, onFilterChange);
}

/**
 * Render priority filter dropdown
 */
function renderPriorityFilterDropdown(
	container: HTMLElement,
	currentValue: string,
	onChange: () => void,
): void {
	const priorityFilter = container.createEl("select");
	priorityFilter.classList.add("priority-filter");
	priorityFilter.setAttribute("aria-label", "優先度フィルタ");

	// Add "all" option
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

	// Set current value
	priorityFilter.value = currentValue;

	// Add change event listener
	priorityFilter.addEventListener("change", onChange);
}

/**
 * Render search box
 */
function renderSearchBox(
	container: HTMLElement,
	currentValue: string,
	onInput: () => void,
): void {
	const searchBox = container.createEl("input");
	searchBox.type = "text";
	searchBox.classList.add("search-box");
	searchBox.placeholder = "検索...";
	searchBox.setAttribute("aria-label", "タスク検索");

	// Set current value
	searchBox.value = currentValue;

	// Add input event listener
	searchBox.addEventListener("input", onInput);
}

/**
 * Render group selector
 */
function renderGroupSelector(
	container: HTMLElement,
	currentValue: string,
	onChange: () => void,
): void {
	const groupSelector = container.createEl("select");
	groupSelector.classList.add("group-selector");
	groupSelector.setAttribute("aria-label", "グループ化");

	// Add options
	const noneOption = groupSelector.createEl("option");
	noneOption.value = "none";
	noneOption.textContent = "なし";

	const projectOption = groupSelector.createEl("option");
	projectOption.value = "project";
	projectOption.textContent = "プロジェクト";

	const contextOption = groupSelector.createEl("option");
	contextOption.value = "context";
	contextOption.textContent = "コンテキスト";

	const priorityOption = groupSelector.createEl("option");
	priorityOption.value = "priority";
	priorityOption.textContent = "優先度";

	// Set current value
	groupSelector.value = currentValue;

	// Add change event listener
	groupSelector.addEventListener("change", onChange);
}

/**
 * Render sort selector
 */
function renderSortSelector(
	container: HTMLElement,
	currentValue: string,
	onChange: () => void,
): void {
	const sortSelector = container.createEl("select");
	sortSelector.classList.add("sort-selector");
	sortSelector.setAttribute("aria-label", "ソート順");

	// Add options
	const defaultOption = sortSelector.createEl("option");
	defaultOption.value = "default";
	defaultOption.textContent = "デフォルト";

	const completionOption = sortSelector.createEl("option");
	completionOption.value = "completion";
	completionOption.textContent = "未完了→完了";

	// Set current value
	sortSelector.value = currentValue;

	// Add change event listener
	sortSelector.addEventListener("change", onChange);
}

/**
 * Group todos by the specified method
 */
function groupTodos(todos: Todo[], groupBy: string): Map<string, Todo[]> | null {
	if (groupBy === "project") {
		return groupByProject(todos);
	} else if (groupBy === "context") {
		return groupByContext(todos);
	} else if (groupBy === "priority") {
		return groupByPriority(todos);
	}
	return null;
}

/**
 * Group todos by priority
 */
function groupByPriority(todos: Todo[]): Map<string, Todo[]> {
	const grouped = new Map<string, Todo[]>();
	for (const todo of todos) {
		const key = todo.priority || "未分類";
		const group = grouped.get(key);
		if (group === undefined) {
			grouped.set(key, [todo]);
		} else {
			group.push(todo);
		}
	}
	return grouped;
}

/**
 * Render grouped tasks
 */
function renderGroupedTasks(
	ul: HTMLUListElement,
	todos: Todo[],
	groupBy: string,
	todoIndexMap: Map<Todo, number>,
	today: Date,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
): void {
	const grouped = groupTodos(todos, groupBy);

	if (grouped === null) {
		// Fallback to no grouping
		for (const todo of todos) {
			const originalIndex = todoIndexMap.get(todo);
			if (originalIndex === undefined) continue;
			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete);
		}
		return;
	}

	// Render each group
	for (const [groupName, groupTodos] of grouped) {
		// Render group header
		const groupHeader = ul.createEl("li");
		groupHeader.classList.add("group-header");
		groupHeader.textContent = groupName;

		// Render todos in this group
		for (const todo of groupTodos) {
			const originalIndex = todoIndexMap.get(todo);
			if (originalIndex === undefined) continue;
			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete);
		}
	}
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
