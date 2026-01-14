import { ItemView, type WorkspaceLeaf, TFile } from "obsidian";
import type TodotxtPlugin from "./main";
import { parseTodoTxt } from "./lib/parser";
import type { Todo } from "./lib/todo";
import { createAndAppendTask } from "./lib/todo";
import { AITaskInputDialog } from "./ui/dialogs/AITaskInputDialog";
import { AddTaskModal } from "./ui/AddTaskModal";
import { EditTaskModal } from "./ui/EditTaskModal";
import {
	removeProjectsAndContextsFromDescription,
	renderRecurrenceIcon,
	type FilterState,
	DEFAULT_FILTER_STATE,
} from "./lib/rendering";
import { getDueDateFromTodo, getDueDateStyle } from "./lib/due";
import { getThresholdDateStyle } from "./lib/threshold";
import { filterByPriority, filterBySearch } from "./lib/filter";
import { groupByProject, groupByContext } from "./lib/group";
import { sortTodos } from "./lib/sort";

export const VIEW_TYPE_TODO_SIDEPANEL = "todotxt-sidepanel";

interface TaskWithFile {
	todo: Todo;
	filePath: string;
	lineIndex: number;
	fileContent: string;
}

export class TodoSidePanelView extends ItemView {
	plugin: TodotxtPlugin;
	private filterState: FilterState = { ...DEFAULT_FILTER_STATE };
	private tasksData: TaskWithFile[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: TodotxtPlugin) {
		super(leaf);
		this.plugin = plugin;
		// Inherit settings
		this.initializeFilterStateFromSettings();
	}

	/**
	 * Initialize filter state from plugin settings
	 */
	private initializeFilterStateFromSettings(): void {
		// Map SortOrder to filter state sort value
		const sortMapping: Record<string, string> = {
			"completion": "completion",
			"priority": "default",
			"date": "default",
			"alphabetical": "default",
		};
		this.filterState.sort = sortMapping[this.plugin.settings.defaultSortOrder] || "default";

		// Map Grouping to filter state group value
		const groupMapping: Record<string, string> = {
			"none": "none",
			"project": "project",
			"context": "context",
		};
		this.filterState.group = groupMapping[this.plugin.settings.defaultGrouping] || "none";
	}

	getViewType(): string {
		return VIEW_TYPE_TODO_SIDEPANEL;
	}

	getDisplayText(): string {
		return "Todo.txt サイドパネル";
	}

	getIcon(): string {
		return "checkbox-glyph";
	}

	async onOpen(): Promise<void> {
		await this.loadTasks();
		this.renderView();
	}

	async onClose(): Promise<void> {
		// Cleanup
	}

	/**
	 * Load tasks from all configured todo.txt files
	 */
	async loadTasks(): Promise<void> {
		this.tasksData = [];
		const filePaths = this.plugin.settings.todotxtFilePaths;

		for (const filePath of filePaths) {
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				const content = await this.app.vault.read(file);
				const todos = parseTodoTxt(content);

				todos.forEach((todo: Todo, index: number) => {
					this.tasksData.push({
						todo,
						filePath: file.path,
						lineIndex: index,
						fileContent: content,
					});
				});
			}
		}
	}

	/**
	 * Render view with current filter state
	 */
	renderView(): void {
		this.contentEl.empty();
		this.contentEl.classList.add("todotxt-view");
		this.contentEl.classList.add("todotxt-sidepanel-compact");

		// Render FAB container
		this.renderFabContainer();

		// Render control bar
		this.renderControlBar();

		// Render task list
		this.renderTaskList();
	}

	/**
	 * Render FAB container with AI add button and task add button
	 */
	renderFabContainer(): void {
		const fabContainer = this.contentEl.createEl("div");
		fabContainer.classList.add("fab-container");

		// AI add button
		const aiButton = fabContainer.createEl("button");
		aiButton.classList.add("ai-add-task-button");
		aiButton.textContent = "✨";
		aiButton.setAttribute("aria-label", "AIでタスクを追加");
		aiButton.setAttribute("title", "AIでタスクを追加");
		aiButton.addEventListener("click", () => {
			this.openAITaskDialog();
		});

		// Main add button
		const addButton = fabContainer.createEl("button");
		addButton.classList.add("add-task-button");
		addButton.textContent = "+";
		addButton.setAttribute("aria-label", "タスクを追加");
		addButton.addEventListener("click", () => {
			this.openAddTaskDialog();
		});
	}

	/**
	 * Render control bar with filters
	 */
	renderControlBar(): void {
		const controlBar = this.contentEl.createEl("div");
		controlBar.classList.add("control-bar");

		// Priority filter
		this.renderPriorityFilter(controlBar);

		// Search box
		this.renderSearchBox(controlBar);

		// Group selector
		this.renderGroupSelector(controlBar);

		// Sort selector
		this.renderSortSelector(controlBar);
	}

	/**
	 * Render priority filter dropdown
	 */
	renderPriorityFilter(container: HTMLElement): void {
		const select = container.createEl("select");
		select.classList.add("priority-filter");
		select.setAttribute("aria-label", "優先度フィルタ");

		const allOption = select.createEl("option");
		allOption.value = "all";
		allOption.textContent = "全て";

		for (let i = 65; i <= 90; i++) {
			const letter = String.fromCharCode(i);
			const option = select.createEl("option");
			option.value = letter;
			option.textContent = letter;
		}

		const noneOption = select.createEl("option");
		noneOption.value = "none";
		noneOption.textContent = "優先度なし";

		select.value = this.filterState.priority;
		select.addEventListener("change", () => {
			this.filterState.priority = select.value;
			this.renderView();
		});
	}

	/**
	 * Render search box
	 */
	renderSearchBox(container: HTMLElement): void {
		const searchBox = container.createEl("input");
		searchBox.type = "text";
		searchBox.classList.add("search-box");
		searchBox.placeholder = "検索...";
		searchBox.setAttribute("aria-label", "タスク検索");
		searchBox.value = this.filterState.search;

		searchBox.addEventListener("input", () => {
			this.filterState.search = searchBox.value;
			this.renderTaskListOnly();
		});
	}

	/**
	 * Render group selector
	 */
	renderGroupSelector(container: HTMLElement): void {
		const select = container.createEl("select");
		select.classList.add("group-selector");
		select.setAttribute("aria-label", "グループ化");

		const options = [
			{ value: "none", text: "なし" },
			{ value: "project", text: "プロジェクト" },
			{ value: "context", text: "コンテキスト" },
			{ value: "priority", text: "優先度" },
		];

		for (const opt of options) {
			const option = select.createEl("option");
			option.value = opt.value;
			option.textContent = opt.text;
		}

		select.value = this.filterState.group;
		select.addEventListener("change", () => {
			this.filterState.group = select.value;
			this.renderView();
		});
	}

	/**
	 * Render sort selector
	 */
	renderSortSelector(container: HTMLElement): void {
		const select = container.createEl("select");
		select.classList.add("sort-selector");
		select.setAttribute("aria-label", "ソート順");

		const options = [
			{ value: "default", text: "デフォルト" },
			{ value: "completion", text: "未完了→完了" },
		];

		for (const opt of options) {
			const option = select.createEl("option");
			option.value = opt.value;
			option.textContent = opt.text;
		}

		select.value = this.filterState.sort;
		select.addEventListener("change", () => {
			this.filterState.sort = select.value;
			this.renderView();
		});
	}

	/**
	 * Render task list only (without re-rendering control bar)
	 * Used for search input to maintain focus
	 */
	renderTaskListOnly(): void {
		// Remove existing task list
		const existingList = this.contentEl.querySelector("ul");
		if (existingList) {
			existingList.remove();
		}

		// Re-render task list
		this.renderTaskList();
	}

	/**
	 * Render task list
	 */
	renderTaskList(): void {
		const ul = this.contentEl.createEl("ul");
		const today = new Date();

		// Apply filters
		let filteredTasks = this.tasksData;

		// Priority filter
		if (this.filterState.priority !== "all") {
			const todos = filteredTasks.map((t) => t.todo);
			const filtered =
				this.filterState.priority === "none"
					? filterByPriority(todos, null)
					: filterByPriority(todos, this.filterState.priority);
			filteredTasks = filteredTasks.filter((t) => filtered.includes(t.todo));
		}

		// Search filter
		if (this.filterState.search) {
			const todos = filteredTasks.map((t) => t.todo);
			const filtered = filterBySearch(todos, this.filterState.search);
			filteredTasks = filteredTasks.filter((t) => filtered.includes(t.todo));
		}

		// Sort
		if (this.filterState.sort === "completion") {
			const todos = filteredTasks.map((t) => t.todo);
			const sorted = sortTodos(todos);
			filteredTasks = sorted
				.map((todo) => filteredTasks.find((t) => t.todo === todo))
				.filter((t): t is TaskWithFile => t !== undefined);
		}

		// Group and render
		if (this.filterState.group !== "none") {
			this.renderGroupedTasks(ul, filteredTasks, today);
		} else {
			for (const task of filteredTasks) {
				this.renderTaskItem(ul, task, today);
			}
		}
	}

	/**
	 * Render grouped tasks
	 */
	renderGroupedTasks(ul: HTMLUListElement, tasks: TaskWithFile[], today: Date): void {
		const todos = tasks.map((t) => t.todo);
		let grouped: Map<string, Todo[]>;

		if (this.filterState.group === "project") {
			grouped = groupByProject(todos);
		} else if (this.filterState.group === "context") {
			grouped = groupByContext(todos);
		} else {
			// priority
			grouped = this.groupByPriority(todos);
		}

		for (const [groupName, groupTodos] of grouped) {
			// Render group header
			const header = ul.createEl("li");
			header.classList.add("group-header");
			header.textContent = groupName;

			// Render tasks in group
			for (const todo of groupTodos) {
				const task = tasks.find((t) => t.todo === todo);
				if (task) {
					this.renderTaskItem(ul, task, today);
				}
			}
		}
	}

	/**
	 * Group todos by priority
	 */
	groupByPriority(todos: Todo[]): Map<string, Todo[]> {
		const grouped = new Map<string, Todo[]>();
		for (const todo of todos) {
			const key = todo.priority || "未分類";
			const group = grouped.get(key);
			if (group) {
				group.push(todo);
			} else {
				grouped.set(key, [todo]);
			}
		}
		return grouped;
	}

	/**
	 * Render single task item with unified UI
	 */
	renderTaskItem(ul: HTMLUListElement, task: TaskWithFile, today: Date): void {
		const li = ul.createEl("li");
		const { todo, filePath } = task;

		// Apply threshold style
		const thresholdStyle = getThresholdDateStyle(todo, today);
		Object.assign(li.style, thresholdStyle);

		// Main row: checkbox + priority + description
		const mainRow = li.createEl("div");
		mainRow.classList.add("task-main-row");

		// Checkbox
		const checkbox = mainRow.createEl("input");
		checkbox.type = "checkbox";
		checkbox.classList.add("task-checkbox");
		checkbox.checked = todo.completed;
		checkbox.addEventListener("click", () => {
			void this.toggleTask(task);
		});

		// Priority badge
		if (todo.priority) {
			const badge = mainRow.createEl("span");
			badge.classList.add("priority", `priority-${todo.priority}`);
			badge.textContent = todo.priority;
		}

		// Description
		const cleanDescription = removeProjectsAndContextsFromDescription(todo.description);
		const descSpan = mainRow.createEl("span");
		descSpan.classList.add("task-description");
		descSpan.textContent = cleanDescription;

		// Tags row
		const hasMetaInfo =
			todo.projects.length > 0 ||
			todo.contexts.length > 0 ||
			todo.tags.rec ||
			getDueDateFromTodo(todo);

		if (hasMetaInfo) {
			const tagsRow = li.createEl("div");
			tagsRow.classList.add("task-item-tags");

			// Project badges
			for (const project of todo.projects) {
				const badge = tagsRow.createEl("span");
				badge.classList.add("tag-chip", "tag-chip--project");
				badge.textContent = `+${project}`;
			}

			// Context badges
			for (const context of todo.contexts) {
				const badge = tagsRow.createEl("span");
				badge.classList.add("tag-chip", "tag-chip--context");
				badge.textContent = `@${context}`;
			}

			// Recurrence icon
			const recIcon = renderRecurrenceIcon(todo);
			if (recIcon) {
				tagsRow.appendChild(recIcon);
			}

			// Due date
			const dueDate = getDueDateFromTodo(todo);
			if (dueDate) {
				const dueBadge = tagsRow.createEl("span");
				dueBadge.classList.add("due-date");
				dueBadge.textContent = `🔥 ${dueDate.toISOString().split("T")[0]!}`;
				const dueDateStyle = getDueDateStyle(dueDate, today);
				Object.assign(dueBadge.style, dueDateStyle);
			}
		}

		// Actions row
		const actionsRow = li.createEl("div");
		actionsRow.classList.add("task-actions-row");

		// Edit button
		const editButton = actionsRow.createEl("button");
		editButton.classList.add("edit-task-button");
		editButton.textContent = "編集";
		editButton.addEventListener("click", () => {
			this.openEditTaskModal(task);
		});

		// Delete button
		const deleteButton = actionsRow.createEl("button");
		deleteButton.classList.add("delete-task-button");
		deleteButton.textContent = "削除";
		deleteButton.addEventListener("click", () => {
			this.openDeleteConfirmDialog(task);
		});

		// Open file button
		const openButton = actionsRow.createEl("button");
		openButton.classList.add("edit-task-button");
		openButton.textContent = "開く";
		openButton.addEventListener("click", () => {
			void this.openFile(filePath);
		});

		if (todo.completed) {
			li.classList.add("completed");
		}
	}

	/**
	 * Toggle task completion
	 */
	async toggleTask(task: TaskWithFile): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(task.filePath);
		if (!(file instanceof TFile)) return;

		const content = await this.app.vault.read(file);
		const lines = content.split("\n");
		const line = lines[task.lineIndex];
		if (!line) return;

		// Toggle completion
		let newLine: string;
		if (task.todo.completed) {
			// Remove 'x ' and completion date
			newLine = line.replace(/^x\s+(\d{4}-\d{2}-\d{2}\s+)?/, "");
		} else {
			// Add 'x ' and completion date
			const today = new Date().toISOString().split("T")[0];
			newLine = `x ${today} ${line}`;
		}

		lines[task.lineIndex] = newLine;
		await this.app.vault.modify(file, lines.join("\n"));

		// Reload and re-render
		await this.loadTasks();
		this.renderView();
	}

	/**
	 * Get the primary todo.txt file path from settings
	 * @returns The first configured file path, or null if none configured
	 */
	private getPrimaryFilePath(): string | null {
		const filePaths = this.plugin.settings.todotxtFilePaths;
		if (filePaths.length === 0) {
			console.warn("No todo.txt files configured");
			return null;
		}

		const targetPath = filePaths[0];
		if (!targetPath) {
			console.warn("Invalid todo.txt file path");
			return null;
		}

		return targetPath;
	}

	/**
	 * Refresh task list after external modification
	 */
	private async refreshTaskList(): Promise<void> {
		await this.loadTasks();
		this.renderView();
	}

	/**
	 * Open add task dialog
	 * If multiple files are configured, open file selection modal first
	 */
	openAddTaskDialog(): void {
		const filePaths = this.plugin.settings.todotxtFilePaths;

		// If multiple files, show file selection modal
		if (filePaths.length > 1) {
			this.openFileSelectionModal();
			return;
		}

		// Single file or no files: use primary file path
		const targetPath = this.getPrimaryFilePath();
		if (!targetPath) return;

		this.openAddTaskDialogForFile(targetPath);
	}

	/**
	 * Open file selection modal for task addition
	 */
	private openFileSelectionModal(): void {
		const filePaths = this.plugin.settings.todotxtFilePaths;

		// Create simple modal for file selection
		const modal = this.createModalBackdrop();
		const dialog = this.createModalDialog();

		const title = this.createModalTitle("ファイルを選択");
		dialog.appendChild(title);

		const list = this.createFileSelectionList(filePaths, modal);
		dialog.appendChild(list);

		const cancelBtn = this.createCancelButton(() => {
			document.body.removeChild(modal);
		});
		dialog.appendChild(cancelBtn);

		modal.appendChild(dialog);

		// Close on backdrop click
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});

		document.body.appendChild(modal);
	}

	/**
	 * Create modal backdrop element
	 */
	private createModalBackdrop(): HTMLDivElement {
		const modal = document.createElement("div");
		modal.classList.add("modal-container");
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;";
		return modal;
	}

	/**
	 * Create modal dialog element
	 */
	private createModalDialog(): HTMLDivElement {
		const dialog = document.createElement("div");
		dialog.classList.add("modal");
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		dialog.style.cssText = "background:var(--background-primary);padding:24px;border-radius:12px;max-width:400px;width:90%;";
		return dialog;
	}

	/**
	 * Create modal title element
	 */
	private createModalTitle(text: string): HTMLHeadingElement {
		const title = document.createElement("h2");
		title.textContent = text;
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		title.style.cssText = "margin:0 0 16px 0;font-size:18px;";
		return title;
	}

	/**
	 * Create file selection list
	 */
	private createFileSelectionList(filePaths: string[], modal: HTMLDivElement): HTMLUListElement {
		const list = document.createElement("ul");
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		list.style.cssText = "list-style:none;padding:0;margin:0 0 16px 0;";

		for (const filePath of filePaths) {
			const item = document.createElement("li");
			// eslint-disable-next-line obsidianmd/no-static-styles-assignment
			item.style.cssText = "padding:12px;margin:4px 0;border:1px solid var(--background-modifier-border);border-radius:6px;cursor:pointer;transition:all 0.15s ease;";
			item.textContent = filePath.split("/").pop() || filePath;

			item.addEventListener("click", () => {
				document.body.removeChild(modal);
				this.openAddTaskDialogForFile(filePath);
			});

			item.addEventListener("mouseenter", () => {
				// eslint-disable-next-line obsidianmd/no-static-styles-assignment
				item.style.background = "var(--background-modifier-hover)";
			});

			item.addEventListener("mouseleave", () => {
				// eslint-disable-next-line obsidianmd/no-static-styles-assignment
				item.style.background = "";
			});

			list.appendChild(item);
		}

		return list;
	}

	/**
	 * Create cancel button
	 */
	private createCancelButton(onClick: () => void): HTMLButtonElement {
		const cancelBtn = document.createElement("button");
		cancelBtn.textContent = "キャンセル";
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		cancelBtn.style.cssText = "padding:8px 16px;border:1px solid var(--background-modifier-border);border-radius:6px;background:transparent;color:var(--text-muted);cursor:pointer;";
		cancelBtn.addEventListener("click", onClick);
		return cancelBtn;
	}

	/**
	 * Open add task dialog for specific file
	 */
	private openAddTaskDialogForFile(filePath: string): void {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) return;

		const modal = new AddTaskModal(
			this.app,
			(description: string, priority?: string, dueDate?: string, thresholdDate?: string) => {
				void (async () => {
					const content = await this.app.vault.read(file);
					const newContent = createAndAppendTask(content, description, priority, dueDate, thresholdDate);
					await this.app.vault.modify(file, newContent);
					await this.refreshTaskList();
				})();
			},
			this.tasksData.map((t) => t.todo)
		);
		modal.open();
	}

	/**
	 * Open edit task modal
	 */
	private openEditTaskModal(task: TaskWithFile): void {
		const file = this.app.vault.getAbstractFileByPath(task.filePath);
		if (!(file instanceof TFile)) return;

		// Extract initial values from todo
		const initialDueDate = task.todo.tags.due || "";
		const initialThresholdDate = task.todo.tags.t || "";

		const modal = new EditTaskModal(
			this.app,
			task.todo.description,
			(description: string, priority?: string, dueDate?: string, thresholdDate?: string) => {
				void (async () => {
					const content = await this.app.vault.read(file);
					const lines = content.split("\n");

					// Reconstruct the line with new values
					const newLine = this.reconstructTaskLine(task.todo, description, priority, dueDate, thresholdDate);

					lines[task.lineIndex] = newLine;
					await this.app.vault.modify(file, lines.join("\n"));
					await this.refreshTaskList();
				})();
			},
			task.todo.priority,
			initialDueDate,
			initialThresholdDate,
			this.tasksData.map((t) => t.todo)
		);
		modal.open();
	}

	/**
	 * Reconstruct task line from todo and new values
	 */
	private reconstructTaskLine(
		originalTodo: Todo,
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string
	): string {
		let line = "";

		// Add completion marker if present
		if (originalTodo.completed && originalTodo.completionDate) {
			line += `x ${originalTodo.completionDate} `;
		}

		// Add priority
		if (priority) {
			line += `(${priority}) `;
		}

		// Add creation date if present
		if (originalTodo.creationDate) {
			line += `${originalTodo.creationDate} `;
		}

		// Add description
		line += description;

		// Add due date tag
		if (dueDate) {
			line += ` due:${dueDate}`;
		}

		// Add threshold date tag
		if (thresholdDate) {
			line += ` t:${thresholdDate}`;
		}

		return line.trim();
	}

	/**
	 * Open delete confirmation dialog
	 */
	private openDeleteConfirmDialog(task: TaskWithFile): void {
		const modal = this.createModalBackdrop();
		const dialog = this.createModalDialog();

		const title = this.createModalTitle("タスクを削除しますか？");
		dialog.appendChild(title);

		// Task preview
		const preview = document.createElement("p");
		preview.textContent = task.todo.description;
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		preview.style.cssText = "margin:16px 0;padding:12px;background:var(--background-secondary);border-radius:6px;";
		dialog.appendChild(preview);

		// Button row
		const buttonRow = document.createElement("div");
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		buttonRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";

		const cancelBtn = this.createCancelButton(() => {
			document.body.removeChild(modal);
		});
		buttonRow.appendChild(cancelBtn);

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "削除";
		// eslint-disable-next-line obsidianmd/no-static-styles-assignment
		deleteBtn.style.cssText = "padding:8px 16px;border:none;border-radius:6px;background:#dc3545;color:white;cursor:pointer;font-weight:500;";
		deleteBtn.addEventListener("click", () => {
			document.body.removeChild(modal);
			void this.deleteTask(task);
		});
		buttonRow.appendChild(deleteBtn);

		dialog.appendChild(buttonRow);
		modal.appendChild(dialog);

		// Close on backdrop click
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});

		document.body.appendChild(modal);
	}

	/**
	 * Delete task from file
	 */
	private async deleteTask(task: TaskWithFile): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(task.filePath);
		if (!(file instanceof TFile)) return;

		const content = await this.app.vault.read(file);
		const lines = content.split("\n");
		lines.splice(task.lineIndex, 1);
		await this.app.vault.modify(file, lines.join("\n"));
		await this.refreshTaskList();
	}

	/**
	 * Open AI task input dialog
	 */
	openAITaskDialog(): void {
		const targetPath = this.getPrimaryFilePath();
		if (!targetPath) return;

		const dialog = new AITaskInputDialog(
			this.app,
			this.plugin.settings.openRouter,
			targetPath,
			() => {
				void this.refreshTaskList();
			}
		);
		dialog.open();
	}

	/**
	 * Open file in workspace
	 */
	async openFile(filePath: string): Promise<void> {
		await this.app.workspace.openLinkText(filePath, "", false);
	}
}
