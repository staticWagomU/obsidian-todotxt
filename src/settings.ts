import { App, PluginSettingTab, Setting } from "obsidian";
import type TodotxtPlugin from "./main";

export type SortOrder = "completion" | "priority" | "date" | "alphabetical";
export type Grouping = "none" | "project" | "context";

export interface TodotxtPluginSettings {
	defaultSortOrder: SortOrder;
	defaultGrouping: Grouping;
	showCompletedTasks: boolean;
	todotxtFilePaths: string[];
}

export const DEFAULT_SETTINGS: TodotxtPluginSettings = {
	defaultSortOrder: "completion",
	defaultGrouping: "none",
	showCompletedTasks: true,
	todotxtFilePaths: [],
};

export class TodotxtSettingTab extends PluginSettingTab {
	plugin: TodotxtPlugin;

	constructor(app: App, plugin: TodotxtPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Default sort order")
			.setDesc("Select the default sort order when opening todo.txt files")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("completion", "完了状態優先")
					.addOption("priority", "優先度順")
					.addOption("date", "作成日順")
					.addOption("alphabetical", "辞書順")
					.setValue(this.plugin.settings.defaultSortOrder)
					.onChange(async (value) => {
						this.plugin.settings.defaultSortOrder = value as SortOrder;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default grouping")
			.setDesc("Select the default grouping method when opening todo.txt files")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("none", "なし")
					.addOption("project", "プロジェクト別")
					.addOption("context", "コンテキスト別")
					.setValue(this.plugin.settings.defaultGrouping)
					.onChange(async (value) => {
						this.plugin.settings.defaultGrouping = value as Grouping;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("完了タスクを表示")
			.setDesc("完了したタスクを表示するかどうかを設定します")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showCompletedTasks)
					.onChange(async (value) => {
						this.plugin.settings.showCompletedTasks = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
