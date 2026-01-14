import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, TodotxtPluginSettings, TodotxtSettingTab } from "./settings";
import { TodotxtView, VIEW_TYPE_TODOTXT } from "./view";
import { TodoSidePanelView, VIEW_TYPE_TODO_SIDEPANEL } from "./side-panel-view";

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
			id: "open-todotxt-side-panel",
			name: "サイドパネルを開く",
			callback: () => {
				void this.openSidePanel();
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
