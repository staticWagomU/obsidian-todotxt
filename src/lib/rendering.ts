import { type Todo } from "./todo";
import { parseTodoTxt } from "./parser";
import { getDueDateFromTodo, getDueDateStyle } from "./due";
import { getThresholdDateStyle } from "./threshold";
import { filterByPriority, filterBySearch } from "./filter";
import { groupByProject, groupByContext } from "./group";
import { sortTodos } from "./sort";
import { extractInternalLinks } from "./internallink";
import { extractExternalLinks } from "./externallink";
import type { FilterPreset } from "./filter-preset";

/**
 * Remove projects (+project), contexts (@context), and date tags (due:, t:) from description
 * Since they will be shown as badges separately
 */
export function removeProjectsAndContextsFromDescription(description: string): string {
	return description
		.replace(/(?:^|\s)\+\S+/g, "")      // +project
		.replace(/(?:^|\s)@\S+/g, "")       // @context
		.replace(/(?:^|\s)due:\S+/g, "")    // due:YYYY-MM-DD
		.replace(/(?:^|\s)t:\S+/g, "")      // t:YYYY-MM-DD
		.replace(/\s+/g, " ")
		.trim();
}

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
	status: string;
	selectionMode?: boolean;
	selectedTodoIds?: number[];
}

/**
 * Default filter state
 */
export const DEFAULT_FILTER_STATE: FilterState = {
	priority: "all",
	search: "",
	group: "none",
	sort: "default",
	status: "all",
	selectionMode: false,
	selectedTodoIds: [],
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
 * Default settings that can be passed from plugin settings
 */
export interface DefaultFilterSettings {
	sort?: string;
	group?: string;
	savedFilters?: FilterPreset[];
	onApplyPreset?: (filterState: FilterState) => void;
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
	defaultSettings?: DefaultFilterSettings,
	onArchive?: () => Promise<void>,
	onAIAdd?: () => void,
	onAIEdit?: (index: number) => void,
	onInlineAdd?: (description: string) => void,
): void {
	// Save current filter state before clearing (with default settings fallback)
	const filterState = saveFilterState(contentEl, defaultSettings);

	contentEl.empty();

	// Add todotxt-view class for styling
	contentEl.classList.add("todotxt-view");

	// Add FAB container (AI add button + task add button)
	renderFabContainer(contentEl, onAddTask, onAIAdd);

	// Add control bar with priority filter, search box, and archive button
	renderControlBar(contentEl, data, filterState, onAddTask, onToggle, onEdit, onDelete, defaultSettings, onArchive);

	// Add inline task input below control bar
	if (onInlineAdd) {
		renderInlineTaskInput(contentEl, onInlineAdd);
	}

	// Render task list section
	renderTaskListSection(contentEl, data, filterState, onToggle, onEdit, onDelete, onAIEdit);
}

/**
 * Render task list section only (without FAB and control bar)
 * Used for search input to maintain focus
 */
function renderTaskListSection(
	contentEl: HTMLElement,
	data: string,
	filterState: FilterState,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
	onAIEdit?: (index: number) => void,
): void {
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
		renderGroupedTasks(ul, filteredTodos, filterState.group, todoIndexMap, today, onToggle, onEdit, onDelete, onAIEdit, filterState);
	} else {
		// Render tasks without grouping
		for (const todo of filteredTodos) {
			const originalIndex = todoIndexMap.get(todo);
			if (originalIndex === undefined) continue;

			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete, onAIEdit, filterState);
		}
	}
}

/**
 * Save current filter state from DOM
 * Falls back to defaultSettings if DOM elements don't exist (first render)
 */
function saveFilterState(contentEl: HTMLElement, defaultSettings?: DefaultFilterSettings): FilterState {
	const previousPriorityFilter = contentEl.querySelector("select.priority-filter");
	const previousSearchBox = contentEl.querySelector("input.search-box");
	const previousGroupSelector = contentEl.querySelector("select.group-selector");
	const previousSortSelector = contentEl.querySelector("select.sort-selector");
	const previousStatusFilter = contentEl.querySelector("select.status-filter");
	const previousBatchButton = contentEl.querySelector("button.batch-selection-button");

	// Use DOM value if exists, otherwise fall back to default settings, then to hardcoded defaults
	const defaultSort = defaultSettings?.sort || "default";
	const defaultGroup = defaultSettings?.group || "none";

	// Check if selection mode is active by looking at button's active class
	const selectionMode = previousBatchButton instanceof HTMLButtonElement && previousBatchButton.classList.contains("active");

	return {
		priority: (previousPriorityFilter instanceof HTMLSelectElement ? previousPriorityFilter.value : null) || "all",
		search: (previousSearchBox instanceof HTMLInputElement ? previousSearchBox.value : null) || "",
		group: (previousGroupSelector instanceof HTMLSelectElement ? previousGroupSelector.value : null) || defaultGroup,
		sort: (previousSortSelector instanceof HTMLSelectElement ? previousSortSelector.value : null) || defaultSort,
		status: (previousStatusFilter instanceof HTMLSelectElement ? previousStatusFilter.value : null) || "all",
		selectionMode: selectionMode,
		selectedTodoIds: [],
	};
}

/**
 * Apply all filters and sorting to todos
 */
function applyFilters(todos: Todo[], filterState: FilterState): Todo[] {
	let filtered = applyPriorityFilter(todos, filterState.priority);
	filtered = applyStatusFilter(filtered, filterState.status);
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
 * Apply status filter to todos
 */
function applyStatusFilter(todos: Todo[], statusValue: string): Todo[] {
	if (statusValue === "all") {
		return todos;
	}
	if (statusValue === "active") {
		return todos.filter(todo => !todo.completed);
	}
	if (statusValue === "completed") {
		return todos.filter(todo => todo.completed);
	}
	return todos;
}

/**
 * Render FAB container with AI add button and task add button
 */
function renderFabContainer(contentEl: HTMLElement, onAddTask: () => void, onAIAdd?: () => void): void {
	const fabContainer = contentEl.createEl("div");
	fabContainer.classList.add("fab-container");

	// AI add button (left side)
	if (onAIAdd) {
		const aiButton = fabContainer.createEl("button");
		aiButton.classList.add("ai-add-task-button");
		aiButton.textContent = "✨";
		aiButton.setAttribute("aria-label", "AIでタスクを追加");
		aiButton.setAttribute("title", "AIでタスクを追加");
		aiButton.addEventListener("click", () => {
			onAIAdd();
		});
	}

	// Main add button (right side)
	const addButton = fabContainer.createEl("button");
	addButton.classList.add("add-task-button");
	addButton.textContent = "+";
	addButton.setAttribute("aria-label", "タスクを追加");
	addButton.addEventListener("click", () => {
		onAddTask();
	});
}

/**
 * Render control bar with filters, sorting options, and archive button
 */
function renderControlBar(
	contentEl: HTMLElement,
	data: string,
	filterState: FilterState,
	onAddTask: () => void,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
	defaultSettings?: DefaultFilterSettings,
	onArchive?: () => Promise<void>,
): void {
	const controlBar = contentEl.createEl("div");
	controlBar.classList.add("control-bar");

	const onFilterChange = () => renderTaskList(contentEl, data, onAddTask, onToggle, onEdit, onDelete, defaultSettings, onArchive);

	// For search, only update task list to maintain focus
	const onSearchInput = () => {
		// Update filterState from search box value
		const searchBox = controlBar.querySelector("input.search-box") as HTMLInputElement;
		if (searchBox) {
			filterState.search = searchBox.value;
		}
		// Remove existing task list
		const existingList = contentEl.querySelector("ul");
		if (existingList) {
			existingList.remove();
		}
		// Re-render task list only (need to get onAIEdit from parent context)
		// For now, pass undefined - this will be fixed when integrating with view
		renderTaskListSection(contentEl, data, filterState, onToggle, onEdit, onDelete);
	};

	// Row 1: Filters and selectors (compact inline)
	const row1 = controlBar.createEl("div");
	row1.classList.add("control-bar-row");

	// Render status filter dropdown (全て/未完了/完了)
	renderStatusFilterDropdown(row1, filterState.status, onFilterChange);

	// Render priority filter dropdown
	renderPriorityFilterDropdown(row1, filterState.priority, onFilterChange);

	// Render group selector
	renderGroupSelector(row1, filterState.group, onFilterChange);

	// Render sort selector
	renderSortSelector(row1, filterState.sort, onFilterChange);

	// Render filter preset dropdown
	renderFilterPresetDropdown(
		row1,
		defaultSettings?.savedFilters || [],
		defaultSettings?.onApplyPreset,
	);

	// Render archive button if onArchive is provided
	if (onArchive) {
		renderArchiveButton(row1, data, onArchive);
	}

	// Render batch selection button
	renderBatchSelectionButton(row1, filterState, onFilterChange);

	// Row 2: Search box (full width)
	renderSearchBox(controlBar, filterState.search, onSearchInput);
}

/**
 * Render status filter dropdown (全て/未完了/完了)
 */
function renderStatusFilterDropdown(
	container: HTMLElement,
	currentValue: string,
	onChange: () => void,
): void {
	const statusFilter = container.createEl("select");
	statusFilter.classList.add("status-filter");
	statusFilter.setAttribute("aria-label", "ステータスフィルタ");

	// Add "all" option
	const allOption = statusFilter.createEl("option");
	allOption.value = "all";
	allOption.textContent = "全て";

	// Add "active" option
	const activeOption = statusFilter.createEl("option");
	activeOption.value = "active";
	activeOption.textContent = "未完了";

	// Add "completed" option
	const completedOption = statusFilter.createEl("option");
	completedOption.value = "completed";
	completedOption.textContent = "完了";

	// Set current value
	statusFilter.value = currentValue;

	// Add change event listener
	statusFilter.addEventListener("change", onChange);
}

/**
 * Render archive button in control bar
 */
function renderArchiveButton(container: HTMLElement, data: string, onArchive: () => Promise<void>): void {
	const todos = parseTodoTxt(data);
	const hasCompletedTasks = todos.some((todo) => todo.completed);

	const archiveButton = container.createEl("button");
	archiveButton.classList.add("archive-button");
	archiveButton.textContent = "アーカイブ";
	archiveButton.setAttribute("aria-label", "完了タスクをアーカイブ");
	archiveButton.disabled = !hasCompletedTasks;
	archiveButton.addEventListener("click", () => {
		void onArchive();
	});
}

/**
 * Render batch selection button in control bar
 */
function renderBatchSelectionButton(
	container: HTMLElement,
	filterState: FilterState,
	onChange: () => void,
): void {
	const batchButton = container.createEl("button");
	batchButton.classList.add("batch-selection-button");

	if (filterState.selectionMode) {
		batchButton.classList.add("active");
		batchButton.textContent = "選択終了";
	} else {
		batchButton.textContent = "一括選択";
	}

	batchButton.setAttribute("aria-label", "一括選択モード");
	batchButton.addEventListener("click", () => {
		// Toggle active class immediately to ensure state is saved correctly
		if (batchButton.classList.contains("active")) {
			batchButton.classList.remove("active");
			batchButton.textContent = "一括選択";
		} else {
			batchButton.classList.add("active");
			batchButton.textContent = "選択終了";
		}
		// Trigger re-render
		onChange();
	});

	// Render select all / deselect all buttons in selection mode
	if (filterState.selectionMode) {
		renderSelectAllButtons(container);
	}
}

/**
 * Render select all and deselect all buttons
 */
function renderSelectAllButtons(container: HTMLElement): void {
	const selectAllButton = container.createEl("button");
	selectAllButton.classList.add("select-all-button");
	selectAllButton.textContent = "全選択";
	selectAllButton.setAttribute("aria-label", "全て選択");
	selectAllButton.addEventListener("click", () => {
		const checkboxes = container.closest(".todotxt-view")?.querySelectorAll<HTMLInputElement>(".task-selection-checkbox");
		if (checkboxes) {
			checkboxes.forEach((checkbox) => {
				checkbox.checked = true;
			});
		}
		updateAIBulkProcessButtonState(container);
	});

	const deselectAllButton = container.createEl("button");
	deselectAllButton.classList.add("deselect-all-button");
	deselectAllButton.textContent = "全解除";
	deselectAllButton.setAttribute("aria-label", "全て解除");
	deselectAllButton.addEventListener("click", () => {
		const checkboxes = container.closest(".todotxt-view")?.querySelectorAll<HTMLInputElement>(".task-selection-checkbox");
		if (checkboxes) {
			checkboxes.forEach((checkbox) => {
				checkbox.checked = false;
			});
		}
		updateAIBulkProcessButtonState(container);
	});

	// AI bulk process button
	const aiBulkButton = container.createEl("button");
	aiBulkButton.classList.add("ai-bulk-process-button");
	aiBulkButton.textContent = "AI一括処理";
	aiBulkButton.setAttribute("aria-label", "AI一括処理");
	aiBulkButton.disabled = true; // Initially disabled until tasks are selected

	aiBulkButton.addEventListener("click", () => {
		// Will be implemented in later subtasks to open dialog
		const selectedIndices = getSelectedTodoIndices(container);
		console.log("AI bulk process for indices:", selectedIndices);
	});
}

/**
 * Get indices of selected todos from checkboxes
 */
function getSelectedTodoIndices(container: HTMLElement): number[] {
	const checkboxes = container.closest(".todotxt-view")?.querySelectorAll<HTMLInputElement>(".task-selection-checkbox:checked");
	if (!checkboxes) return [];
	const indices: number[] = [];
	checkboxes.forEach((checkbox) => {
		const index = parseInt(checkbox.dataset.index || "", 10);
		if (!isNaN(index)) {
			indices.push(index);
		}
	});
	return indices;
}

/**
 * Update AI bulk process button state based on selection
 */
function updateAIBulkProcessButtonState(container: HTMLElement): void {
	const aiBulkButton = container.querySelector<HTMLButtonElement>(".ai-bulk-process-button");
	if (!aiBulkButton) return;

	const selectedCount = getSelectedTodoIndices(container).length;
	aiBulkButton.disabled = selectedCount === 0;
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
	// Create search container for search box
	const searchContainer = container.createEl("div");
	searchContainer.classList.add("search-container");

	const searchBox = searchContainer.createEl("input");
	searchBox.type = "text";
	searchBox.classList.add("search-box");
	searchBox.placeholder = "タスク検索...";
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
 * Render filter preset dropdown
 */
function renderFilterPresetDropdown(
	container: HTMLElement,
	presets: FilterPreset[],
	onApply?: (filterState: FilterState) => void,
): void {
	const presetDropdown = container.createEl("select");
	presetDropdown.classList.add("filter-preset-dropdown");
	presetDropdown.setAttribute("aria-label", "フィルタープリセット");

	// Placeholder option
	const placeholderOption = presetDropdown.createEl("option");
	placeholderOption.value = "";
	if (presets.length === 0) {
		placeholderOption.textContent = "保存済みなし";
	} else {
		placeholderOption.textContent = "プリセット選択...";
	}

	// Add preset options
	for (const preset of presets) {
		const option = presetDropdown.createEl("option");
		option.value = preset.id;
		option.textContent = preset.name;
	}

	// Add change event listener
	presetDropdown.addEventListener("change", () => {
		const selectedId = presetDropdown.value;
		if (!selectedId || !onApply) return;

		const selectedPreset = presets.find(p => p.id === selectedId);
		if (selectedPreset) {
			onApply(selectedPreset.filterState);
		}
	});
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
	onAIEdit?: (index: number) => void,
	filterState?: FilterState,
): void {
	const grouped = groupTodos(todos, groupBy);

	if (grouped === null) {
		// Fallback to no grouping
		for (const todo of todos) {
			const originalIndex = todoIndexMap.get(todo);
			if (originalIndex === undefined) continue;
			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete, onAIEdit, filterState);
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
			renderTaskItem(ul, todo, originalIndex, today, onToggle, onEdit, onDelete, onAIEdit, filterState);
		}
	}
}

/**
 * Render single task item
 * モバイル対応のため、要素をグループ化して縦に配置可能な構造にする
 */
function renderTaskItem(
	ul: HTMLUListElement,
	todo: Todo,
	index: number,
	today: Date,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
	onAIEdit?: (index: number) => void,
	filterState?: FilterState,
): void {
	const li = ul.createEl("li");

	// Apply threshold date grayout style if t: tag exists
	const thresholdStyle = getThresholdDateStyle(todo, today);
	Object.assign(li.style, thresholdStyle);

	// メインコンテンツ行: チェックボックス + 優先度 + 説明
	const mainRow = li.createEl("div");
	mainRow.classList.add("task-main-row");

	// Add selection checkbox if in selection mode
	if (filterState?.selectionMode) {
		const selectionCheckbox = mainRow.createEl("input");
		selectionCheckbox.type = "checkbox";
		selectionCheckbox.classList.add("task-selection-checkbox");
		selectionCheckbox.dataset.index = String(index);
		// Check if this task is selected
		if (filterState.selectedTodoIds?.includes(index)) {
			selectionCheckbox.checked = true;
		}
		// Update AI bulk process button state when checkbox changes
		selectionCheckbox.addEventListener("change", () => {
			const controlBar = ul.closest(".todotxt-view")?.querySelector(".control-bar-row");
			if (controlBar) {
				updateAIBulkProcessButtonState(controlBar as HTMLElement);
			}
		});
	}

	// Add checkbox
	const checkbox = mainRow.createEl("input");
	checkbox.type = "checkbox";
	checkbox.classList.add("task-checkbox");
	checkbox.checked = todo.completed;
	checkbox.dataset.index = String(index);

	// Add click handler
	checkbox.addEventListener("click", () => {
		void onToggle(index);
	});

	// Add priority badge if priority exists
	if (todo.priority) {
		const badge = mainRow.createEl("span");
		badge.classList.add("priority");
		badge.classList.add(`priority-${todo.priority}`);
		badge.textContent = todo.priority;
	}

	// Render description without projects/contexts (they will be shown as badges)
	const cleanDescription = removeProjectsAndContextsFromDescription(todo.description);
	const descSpan = mainRow.createEl("span");
	descSpan.classList.add("task-description");
	descSpan.textContent = cleanDescription;

	// タグ行: プロジェクト + コンテキスト + 繰り返し + 日付
	const hasMetaInfo = todo.projects.length > 0 || todo.contexts.length > 0 || todo.tags.rec || getDueDateFromTodo(todo);
	if (hasMetaInfo) {
		const tagsRow = li.createEl("div");
		tagsRow.classList.add("task-item-tags");

		// Add project badges
		for (const project of todo.projects) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--project");
			badge.textContent = `+${project}`;
		}

		// Add context badges
		for (const context of todo.contexts) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--context");
			badge.textContent = `@${context}`;
		}

		// Add recurrence icon if rec: tag exists
		const recIcon = renderRecurrenceIcon(todo);
		if (recIcon) {
			tagsRow.appendChild(recIcon);
		}

		// Add due date badge if due: tag exists
		const dueDate = getDueDateFromTodo(todo);
		if (dueDate) {
			const dueBadge = tagsRow.createEl("span");
			dueBadge.classList.add("due-date");
			dueBadge.textContent = `🔥 ${dueDate.toISOString().split("T")[0]!}`;

			// Apply style based on due date status
			const dueDateStyle = getDueDateStyle(dueDate, today);
			Object.assign(dueBadge.style, dueDateStyle);
		}
	}

	// アクションボタン行
	const actionsRow = li.createEl("div");
	actionsRow.classList.add("task-actions-row");

	// Add edit button
	const editButton = actionsRow.createEl("button");
	editButton.classList.add("edit-task-button");
	editButton.textContent = "編集";
	editButton.dataset.index = String(index);
	editButton.addEventListener("click", () => {
		onEdit(index);
	});

	// Add AI edit button if callback is provided
	if (onAIEdit) {
		const aiEditButton = actionsRow.createEl("button");
		aiEditButton.classList.add("ai-edit-task-button");
		aiEditButton.textContent = "AI編集";
		aiEditButton.dataset.index = String(index);
		aiEditButton.addEventListener("click", () => {
			onAIEdit(index);
		});
	}

	// Add delete button
	const deleteButton = actionsRow.createEl("button");
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

/**
 * Render inline task input field
 * Allows quick task addition without opening a modal
 * Uses Ctrl+Enter (Cmd+Enter on Mac) to submit - Enter alone is reserved for IME input
 */
export function renderInlineTaskInput(
	container: HTMLElement,
	onAddTask: (description: string) => void,
): void {
	const inputContainer = container.createEl("div");
	inputContainer.classList.add("inline-task-input-container");

	const inputElement = inputContainer.createEl("input");
	inputElement.type = "text";
	inputElement.classList.add("inline-task-input");
	inputElement.placeholder = "タスクを追加... (Ctrl+Enter)";
	inputElement.setAttribute("aria-label", "インラインタスク入力");

	// Helper function to add task
	const addTask = () => {
		const description = inputElement.value.trim();
		// Skip empty input
		if (description === "") {
			return;
		}
		onAddTask(description);
		// Clear input after adding task
		inputElement.value = "";
	};

	// Handle Ctrl+Enter (or Cmd+Enter on Mac) to add task
	// Enter alone is reserved for Japanese IME composition
	inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			addTask();
		}
	});

	// Add button next to input for mouse/touch users
	const addButton = inputContainer.createEl("button");
	addButton.classList.add("inline-task-add-button");
	addButton.textContent = "追加";
	addButton.setAttribute("aria-label", "タスクを追加");
	addButton.addEventListener("click", addTask);
}

/**
 * Long press duration for context menu trigger (in ms)
 * Sprint 63 - PBI-061: AC5対応
 */
const LONG_PRESS_DURATION = 500;

/**
 * Render single task item with context menu support
 * Adds right-click and long-press handlers for context menu
 * Sprint 63 - PBI-061: AC1, AC5対応
 */
export function renderTaskItemWithContextMenu(
	ul: HTMLUListElement,
	todo: Todo,
	index: number,
	today: Date,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
	onContextMenu: (index: number, position: { x: number; y: number }) => void,
	onAIEdit?: (index: number) => void,
	filterState?: FilterState,
): void {
	const li = ul.createEl("li");

	// Apply threshold date grayout style if t: tag exists
	const thresholdStyle = getThresholdDateStyle(todo, today);
	Object.assign(li.style, thresholdStyle);

	// Context menu state for long press
	let longPressTimer: number | null = null;
	let touchStartPosition: { x: number; y: number } | null = null;

	// Long press handler (AC5: モバイル対応)
	li.addEventListener("touchstart", (event: TouchEvent) => {
		const touch = event.touches[0];
		if (!touch) return;

		touchStartPosition = { x: touch.clientX, y: touch.clientY };

		longPressTimer = window.setTimeout(() => {
			if (touchStartPosition) {
				onContextMenu(index, touchStartPosition);
			}
			longPressTimer = null;
		}, LONG_PRESS_DURATION);
	});

	li.addEventListener("touchend", () => {
		if (longPressTimer !== null) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		touchStartPosition = null;
	});

	li.addEventListener("touchmove", () => {
		if (longPressTimer !== null) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		touchStartPosition = null;
	});

	// Right-click handler (AC1: 右クリックでコンテキストメニュー表示)
	li.addEventListener("contextmenu", (event: MouseEvent) => {
		event.preventDefault();
		onContextMenu(index, { x: event.clientX, y: event.clientY });
	});

	// メインコンテンツ行: チェックボックス + 優先度 + 説明
	const mainRow = li.createEl("div");
	mainRow.classList.add("task-main-row");

	// Add selection checkbox if in selection mode
	if (filterState?.selectionMode) {
		const selectionCheckbox = mainRow.createEl("input");
		selectionCheckbox.type = "checkbox";
		selectionCheckbox.classList.add("task-selection-checkbox");
		selectionCheckbox.dataset.index = String(index);
		if (filterState.selectedTodoIds?.includes(index)) {
			selectionCheckbox.checked = true;
		}
		selectionCheckbox.addEventListener("change", () => {
			const controlBar = ul.closest(".todotxt-view")?.querySelector(".control-bar-row");
			if (controlBar) {
				updateAIBulkProcessButtonState(controlBar as HTMLElement);
			}
		});
	}

	// Add checkbox
	const checkbox = mainRow.createEl("input");
	checkbox.type = "checkbox";
	checkbox.classList.add("task-checkbox");
	checkbox.checked = todo.completed;
	checkbox.dataset.index = String(index);

	checkbox.addEventListener("click", () => {
		void onToggle(index);
	});

	// Add priority badge if priority exists
	if (todo.priority) {
		const badge = mainRow.createEl("span");
		badge.classList.add("priority");
		badge.classList.add(`priority-${todo.priority}`);
		badge.textContent = todo.priority;
	}

	// Render description without projects/contexts
	const cleanDescription = removeProjectsAndContextsFromDescription(todo.description);
	const descSpan = mainRow.createEl("span");
	descSpan.classList.add("task-description");
	descSpan.textContent = cleanDescription;

	// タグ行: プロジェクト + コンテキスト + 繰り返し + 日付
	const hasMetaInfo = todo.projects.length > 0 || todo.contexts.length > 0 || todo.tags.rec || getDueDateFromTodo(todo);
	if (hasMetaInfo) {
		const tagsRow = li.createEl("div");
		tagsRow.classList.add("task-item-tags");

		for (const project of todo.projects) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--project");
			badge.textContent = `+${project}`;
		}

		for (const context of todo.contexts) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--context");
			badge.textContent = `@${context}`;
		}

		const recIcon = renderRecurrenceIcon(todo);
		if (recIcon) {
			tagsRow.appendChild(recIcon);
		}

		const dueDate = getDueDateFromTodo(todo);
		if (dueDate) {
			const dueBadge = tagsRow.createEl("span");
			dueBadge.classList.add("due-date");
			dueBadge.textContent = `🔥 ${dueDate.toISOString().split("T")[0]!}`;
			const dueDateStyle = getDueDateStyle(dueDate, today);
			Object.assign(dueBadge.style, dueDateStyle);
		}
	}

	// アクションボタン行
	const actionsRow = li.createEl("div");
	actionsRow.classList.add("task-actions-row");

	const editButton = actionsRow.createEl("button");
	editButton.classList.add("edit-task-button");
	editButton.textContent = "編集";
	editButton.dataset.index = String(index);
	editButton.addEventListener("click", () => {
		onEdit(index);
	});

	if (onAIEdit) {
		const aiEditButton = actionsRow.createEl("button");
		aiEditButton.classList.add("ai-edit-task-button");
		aiEditButton.textContent = "AI編集";
		aiEditButton.dataset.index = String(index);
		aiEditButton.addEventListener("click", () => {
			onAIEdit(index);
		});
	}

	const deleteButton = actionsRow.createEl("button");
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

/**
 * Render inline edit input field for editing existing tasks
 * Supports Enter/Cmd+Enter to save, Esc to cancel, blur to auto-save
 */
export function renderInlineEditInput(
	container: HTMLElement,
	initialValue: string,
	onSave: (value: string) => void,
	onCancel: () => void,
): void {
	const editContainer = container.createEl("div");
	editContainer.classList.add("inline-edit-container");

	const inputElement = editContainer.createEl("input");
	inputElement.type = "text";
	inputElement.classList.add("inline-edit-input");
	inputElement.value = initialValue;
	inputElement.setAttribute("aria-label", "タスクを編集");

	// Flag to prevent double-save on blur after Enter/Esc
	let isCompleted = false;

	// Handle keyboard events
	inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Enter") {
			isCompleted = true;
			onSave(inputElement.value);
		} else if (event.key === "Escape") {
			isCompleted = true;
			onCancel();
		}
	});

	// Handle blur for auto-save
	inputElement.addEventListener("blur", () => {
		if (!isCompleted) {
			onSave(inputElement.value);
		}
	});
}

/**
 * Render single task item with inline edit support
 * Adds dblclick and Enter key handlers for inline editing (AC1, AC2)
 */
export function renderTaskItemWithInlineEdit(
	ul: HTMLUListElement,
	todo: Todo,
	index: number,
	today: Date,
	onToggle: (index: number) => Promise<void>,
	onEdit: (index: number) => void,
	onDelete: (index: number) => Promise<void>,
	onInlineEdit: (index: number, description: string) => void,
	onAIEdit?: (index: number) => void,
	filterState?: FilterState,
): void {
	const li = ul.createEl("li");

	// Apply threshold date grayout style if t: tag exists
	const thresholdStyle = getThresholdDateStyle(todo, today);
	Object.assign(li.style, thresholdStyle);

	// Make li focusable for keyboard navigation
	li.setAttribute("tabindex", "0");

	// メインコンテンツ行: チェックボックス + 優先度 + 説明
	const mainRow = li.createEl("div");
	mainRow.classList.add("task-main-row");

	// Add selection checkbox if in selection mode
	if (filterState?.selectionMode) {
		const selectionCheckbox = mainRow.createEl("input");
		selectionCheckbox.type = "checkbox";
		selectionCheckbox.classList.add("task-selection-checkbox");
		selectionCheckbox.dataset.index = String(index);
		// Check if this task is selected
		if (filterState.selectedTodoIds?.includes(index)) {
			selectionCheckbox.checked = true;
		}
		// Update AI bulk process button state when checkbox changes
		selectionCheckbox.addEventListener("change", () => {
			const controlBar = ul.closest(".todotxt-view")?.querySelector(".control-bar-row");
			if (controlBar) {
				updateAIBulkProcessButtonState(controlBar as HTMLElement);
			}
		});
	}

	// Add checkbox
	const checkbox = mainRow.createEl("input");
	checkbox.type = "checkbox";
	checkbox.classList.add("task-checkbox");
	checkbox.checked = todo.completed;
	checkbox.dataset.index = String(index);

	// Add click handler
	checkbox.addEventListener("click", () => {
		void onToggle(index);
	});

	// Add priority badge if priority exists
	if (todo.priority) {
		const badge = mainRow.createEl("span");
		badge.classList.add("priority");
		badge.classList.add(`priority-${todo.priority}`);
		badge.textContent = todo.priority;
	}

	// Render description without projects/contexts (they will be shown as badges)
	const cleanDescription = removeProjectsAndContextsFromDescription(todo.description);
	const descSpan = mainRow.createEl("span");
	descSpan.classList.add("task-description");
	descSpan.textContent = cleanDescription;

	// Add dblclick handler for inline edit (AC1)
	descSpan.addEventListener("dblclick", () => {
		onInlineEdit(index, todo.description);
	});

	// Add Enter key handler for inline edit (AC2)
	li.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Enter") {
			onInlineEdit(index, todo.description);
		}
	});

	// タグ行: プロジェクト + コンテキスト + 繰り返し + 日付
	const hasMetaInfo = todo.projects.length > 0 || todo.contexts.length > 0 || todo.tags.rec || getDueDateFromTodo(todo);
	if (hasMetaInfo) {
		const tagsRow = li.createEl("div");
		tagsRow.classList.add("task-item-tags");

		// Add project badges
		for (const project of todo.projects) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--project");
			badge.textContent = `+${project}`;
		}

		// Add context badges
		for (const context of todo.contexts) {
			const badge = tagsRow.createEl("span");
			badge.classList.add("tag-chip", "tag-chip--context");
			badge.textContent = `@${context}`;
		}

		// Add recurrence icon if rec: tag exists
		const recIcon = renderRecurrenceIcon(todo);
		if (recIcon) {
			tagsRow.appendChild(recIcon);
		}

		// Add due date badge if due: tag exists
		const dueDate = getDueDateFromTodo(todo);
		if (dueDate) {
			const dueBadge = tagsRow.createEl("span");
			dueBadge.classList.add("due-date");
			dueBadge.textContent = `${dueDate.toISOString().split("T")[0]!}`;

			// Apply style based on due date status
			const dueDateStyle = getDueDateStyle(dueDate, today);
			Object.assign(dueBadge.style, dueDateStyle);
		}
	}

	// アクションボタン行
	const actionsRow = li.createEl("div");
	actionsRow.classList.add("task-actions-row");

	// Add edit button
	const editButton = actionsRow.createEl("button");
	editButton.classList.add("edit-task-button");
	editButton.textContent = "編集";
	editButton.dataset.index = String(index);
	editButton.addEventListener("click", () => {
		onEdit(index);
	});

	// Add AI edit button if callback is provided
	if (onAIEdit) {
		const aiEditButton = actionsRow.createEl("button");
		aiEditButton.classList.add("ai-edit-task-button");
		aiEditButton.textContent = "AI編集";
		aiEditButton.dataset.index = String(index);
		aiEditButton.addEventListener("click", () => {
			onAIEdit(index);
		});
	}

	// Add delete button
	const deleteButton = actionsRow.createEl("button");
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
