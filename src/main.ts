import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, TodotxtPluginSettings, TodotxtSettingTab } from "./settings";
import { TodotxtView, VIEW_TYPE_TODOTXT } from "./view";

export default class TodotxtPlugin extends Plugin {
	settings: TodotxtPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register TodotxtView
		this.registerView(VIEW_TYPE_TODOTXT, (leaf) => new TodotxtView(leaf));

		// Register file extensions
		this.registerExtensions(["txt", "todotxt"], VIEW_TYPE_TODOTXT);

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new TodotxtSettingTab(this.app, this));
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
