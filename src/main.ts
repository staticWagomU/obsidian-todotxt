import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, TodotxtPluginSettings, TodotxtSettingTab } from "./settings";
import { TodotxtView, VIEW_TYPE_TODOTXT } from "./view";
import { TodoSidePanelView, VIEW_TYPE_TODO_SIDEPANEL } from "./side-panel-view";
import { COMMANDS } from "./lib/commands";

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
