import { App, PluginSettingTab } from "obsidian";
import type TodotxtPlugin from "./main";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TodotxtPluginSettings {
	// Settings will be added in future sprints
}

export const DEFAULT_SETTINGS: TodotxtPluginSettings = {};

export class TodotxtSettingTab extends PluginSettingTab {
	plugin: TodotxtPlugin;

	constructor(app: App, plugin: TodotxtPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		// Settings UI will be added in future sprints
	}
}
