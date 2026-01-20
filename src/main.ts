import { Plugin, Notice } from "obsidian";
import { DEFAULT_SETTINGS, TodotxtPluginSettings, TodotxtSettingTab } from "./settings";
import { TodotxtView, VIEW_TYPE_TODOTXT } from "./view";
import { TodoSidePanelView, VIEW_TYPE_TODO_SIDEPANEL } from "./side-panel-view";
import { COMMANDS } from "./lib/commands";
import {
	isDailyNotesPluginEnabled,
	formatTasksForDailyNote,
	insertContentAtPosition,
	parseMarkdownCheckboxes,
} from "./lib/daily-notes";
import { filterFocusTodos } from "./lib/focus-filter";
import { parseTodoTxt, appendTaskToFile } from "@wagomu/todotxt-parser";
import { createDailyNote, getDailyNote, getAllDailyNotes } from "obsidian-daily-notes-interface";

export default class TodotxtPlugin extends Plugin {
	settings: TodotxtPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register TodotxtView with plugin instance for settings access
		this.registerView(VIEW_TYPE_TODOTXT, (leaf) => new TodotxtView(leaf, this));

		// Register TodoSidePanelView for side panel
		this.registerView(VIEW_TYPE_TODO_SIDEPANEL, (leaf) => new TodoSidePanelView(leaf, this));

		// Register file extensions
		this.registerExtensions(["txt", "todotxt"], VIEW_TYPE_TODOTXT);

		// Add ribbon icon to open side panel
		this.addRibbonIcon("check-square", "Todo.txt サイドパネルを開く", () => {
			void this.openSidePanel();
		});

		// Add command to open side panel
		this.addCommand({
			id: COMMANDS.openSidePanel.id,
			name: COMMANDS.openSidePanel.name,
			callback: () => {
				void this.openSidePanel();
			},
		});

		// Add command for new task (Ctrl+N / Cmd+N)
		this.addCommand({
			id: COMMANDS.newTask.id,
			name: COMMANDS.newTask.name,
			callback: () => {
				void this.openNewTaskDialog();
			},
		});

		// Add command for focus search (Ctrl+F / Cmd+F)
		this.addCommand({
			id: COMMANDS.focusSearch.id,
			name: COMMANDS.focusSearch.name,
			callback: () => {
				void this.focusSearchBox();
			},
		});

		// Add command for focus view (PBI-065 AC6)
		this.addCommand({
			id: COMMANDS.openFocusView.id,
			name: COMMANDS.openFocusView.name,
			callback: () => {
				this.openFocusView();
			},
		});

		// Add command for template task (PBI-066 AC2)
		this.addCommand({
			id: COMMANDS.addTemplateTask.id,
			name: COMMANDS.addTemplateTask.name,
			callback: () => {
				this.openTemplateSelectModal();
			},
		});

		// Add command for exporting tasks to daily note (PBI-068)
		this.addCommand({
			id: COMMANDS.exportToDailyNote.id,
			name: COMMANDS.exportToDailyNote.name,
			callback: () => {
				void this.exportToDailyNote();
			},
		});

		// Add command for importing tasks from daily note (PBI-068)
		this.addCommand({
			id: COMMANDS.importFromDailyNote.id,
			name: COMMANDS.importFromDailyNote.name,
			callback: () => {
				void this.importFromDailyNote();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TodotxtSettingTab(this.app, this));
	}

	async openSidePanel(): Promise<void> {
		const { workspace } = this.app;

		// Check if the view is already open
		const existingLeaf = workspace.getLeavesOfType(VIEW_TYPE_TODO_SIDEPANEL)[0];
		if (existingLeaf) {
			// If already open, reveal it
			await workspace.revealLeaf(existingLeaf);
			return;
		}

		// Open in right sidebar
		const leaf = workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_TODO_SIDEPANEL,
				active: true,
			});
			await workspace.revealLeaf(leaf);
		}
	}

	onunload() {}

	/**
	 * Open new task dialog in active view
	 * Called by keyboard shortcut (Ctrl+N / Cmd+N)
	 */
	async openNewTaskDialog(): Promise<void> {
		const { workspace } = this.app;

		// Try to find active TodotxtView or TodoSidePanelView
		const activeView = workspace.getActiveViewOfType(TodotxtView);
		if (activeView) {
			activeView.openAddTaskModal();
			return;
		}

		// If no active TodotxtView, try side panel
		const sidePanelLeaf = workspace.getLeavesOfType(VIEW_TYPE_TODO_SIDEPANEL)[0];
		if (sidePanelLeaf?.view instanceof TodoSidePanelView) {
			sidePanelLeaf.view.openAddTaskDialog();
			return;
		}

		// If neither is available, open side panel first
		await this.openSidePanel();
		// Then try to open dialog in side panel after a short delay
		const newSidePanelLeaf = workspace.getLeavesOfType(VIEW_TYPE_TODO_SIDEPANEL)[0];
		if (newSidePanelLeaf?.view instanceof TodoSidePanelView) {
			newSidePanelLeaf.view.openAddTaskDialog();
		}
	}

	/**
	 * Focus search box in active view
	 * Called by keyboard shortcut (Ctrl+F / Cmd+F)
	 */
	async focusSearchBox(): Promise<void> {
		const { workspace } = this.app;

		// Try to find active TodotxtView
		const activeView = workspace.getActiveViewOfType(TodotxtView);
		if (activeView) {
			const searchBox = activeView.contentEl.querySelector<HTMLInputElement>("input.search-box");
			if (searchBox) {
				searchBox.focus();
				return;
			}
		}

		// If no active TodotxtView, try side panel
		const sidePanelLeaf = workspace.getLeavesOfType(VIEW_TYPE_TODO_SIDEPANEL)[0];
		if (sidePanelLeaf?.view instanceof TodoSidePanelView) {
			const searchBox = sidePanelLeaf.view.contentEl.querySelector<HTMLInputElement>("input.search-box");
			if (searchBox) {
				searchBox.focus();
				return;
			}
		}

		// If neither is available, open side panel first then focus
		await this.openSidePanel();
		const newSidePanelLeaf = workspace.getLeavesOfType(VIEW_TYPE_TODO_SIDEPANEL)[0];
		if (newSidePanelLeaf?.view instanceof TodoSidePanelView) {
			const searchBox = newSidePanelLeaf.view.contentEl.querySelector<HTMLInputElement>("input.search-box");
			if (searchBox) {
				searchBox.focus();
			}
		}
	}

	/**
	 * Open focus view modal (PBI-065 AC6)
	 * Shows today's tasks filtered by due:/t: today or earlier
	 */
	openFocusView(): void {
		const { workspace } = this.app;

		// Try to find active TodotxtView
		const activeView = workspace.getActiveViewOfType(TodotxtView);
		if (activeView) {
			activeView.openFocusViewModal();
			return;
		}

		// If no active TodotxtView, try to find any TodotxtView
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TODOTXT);
		if (leaves.length > 0 && leaves[0]?.view instanceof TodotxtView) {
			leaves[0].view.openFocusViewModal();
		}
	}

	/**
	 * Open template select modal (PBI-066 AC2)
	 * Shows list of templates to select from
	 */
	openTemplateSelectModal(): void {
		const { workspace } = this.app;

		// Try to find active TodotxtView
		const activeView = workspace.getActiveViewOfType(TodotxtView);
		if (activeView) {
			activeView.openTemplateSelectModal();
			return;
		}

		// If no active TodotxtView, try to find any TodotxtView
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TODOTXT);
		if (leaves.length > 0 && leaves[0]?.view instanceof TodotxtView) {
			leaves[0].view.openTemplateSelectModal();
		}
	}

	/**
	 * Export today's tasks to daily note (PBI-068 AC1)
	 * Uses filterFocusTodos to get today's tasks and inserts them into the daily note
	 */
	async exportToDailyNote(): Promise<void> {
		// Check if Daily Notes plugin is enabled
		if (!isDailyNotesPluginEnabled()) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice("Daily Notesプラグインが有効になっていません");
			return;
		}

		// Get active TodotxtView to access tasks
		const { workspace } = this.app;
		const activeView = workspace.getActiveViewOfType(TodotxtView);

		let todoContent: string;
		if (activeView) {
			todoContent = activeView.data;
		} else {
			// Try to find any TodotxtView
			const leaves = workspace.getLeavesOfType(VIEW_TYPE_TODOTXT);
			if (leaves.length === 0 || !(leaves[0]?.view instanceof TodotxtView)) {
				new Notice("Todo.txtファイルを開いてください");
				return;
			}
			todoContent = (leaves[0].view).data;
		}

		// Parse todos and filter for today
		const todos = parseTodoTxt(todoContent);
		const today = new Date();
		const todayTasks = filterFocusTodos(todos, today);

		if (todayTasks.length === 0) {
			new Notice("今日のタスクがありません");
			return;
		}

		// Format tasks for daily note
		const { taskPrefix, insertPosition } = this.settings.dailyNotes;
		const formattedTasks = formatTasksForDailyNote(todayTasks, taskPrefix);

		// Get or create today's daily note
		try {
			// Get or create today's daily note
			const allDailyNotes = getAllDailyNotes();
			let dailyNote = getDailyNote(window.moment(), allDailyNotes);
			if (!dailyNote) {
				dailyNote = await createDailyNote(window.moment());
			}

			// Read current content
			const existingContent = await this.app.vault.read(dailyNote);

			// Insert at configured position
			const newContent = insertContentAtPosition(existingContent, formattedTasks, insertPosition);

			// Write back
			await this.app.vault.modify(dailyNote, newContent);

			new Notice(`${todayTasks.length}件のタスクをデイリーノートにエクスポートしました`);
		} catch (error) {
			console.error("Failed to export to daily note:", error);
			new Notice("デイリーノートへのエクスポートに失敗しました");
		}
	}

	/**
	 * Import tasks from daily note (PBI-068 AC2)
	 * Parses markdown checkboxes from the daily note and adds them to todo.txt
	 */
	async importFromDailyNote(): Promise<void> {
		// Check if Daily Notes plugin is enabled
		if (!isDailyNotesPluginEnabled()) {
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			new Notice("Daily Notesプラグインが有効になっていません");
			return;
		}

		// Get active TodotxtView to add tasks
		const { workspace } = this.app;
		const activeView = workspace.getActiveViewOfType(TodotxtView);

		if (!activeView) {
			// Try to find any TodotxtView
			const leaves = workspace.getLeavesOfType(VIEW_TYPE_TODOTXT);
			if (leaves.length === 0 || !(leaves[0]?.view instanceof TodotxtView)) {
				new Notice("Todo.txtファイルを開いてください");
				return;
			}
		}

		const targetView = activeView ?? (workspace.getLeavesOfType(VIEW_TYPE_TODOTXT)[0]?.view as TodotxtView);

		// Get today's daily note
		try {
			const allDailyNotes = getAllDailyNotes();
			const dailyNote = getDailyNote(window.moment(), allDailyNotes);

			if (!dailyNote) {
				new Notice("今日のデイリーノートが見つかりません");
				return;
			}

			// Read daily note content
			const dailyNoteContent = await this.app.vault.read(dailyNote);

			// Parse checkboxes
			const importedTasks = parseMarkdownCheckboxes(dailyNoteContent);

			// Filter only uncompleted tasks
			const uncompletedTasks = importedTasks.filter((t) => !t.completed);

			if (uncompletedTasks.length === 0) {
				new Notice("インポートするタスクがありません");
				return;
			}

			// Add tasks to todo.txt
			let newContent = targetView.data;
			for (const task of uncompletedTasks) {
				newContent = appendTaskToFile(newContent, task);
			}

			// Update view
			targetView.data = newContent;
			targetView.requestSave();

			new Notice(`${uncompletedTasks.length}件のタスクをインポートしました`);
		} catch (error) {
			console.error("Failed to import from daily note:", error);
			new Notice("デイリーノートからのインポートに失敗しました");
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TodotxtPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
