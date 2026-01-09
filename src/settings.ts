import { App, PluginSettingTab, Setting } from "obsidian";
import type TodotxtPlugin from "./main";

export type SortOrder = "completion" | "priority" | "date" | "alphabetical";

export interface TodotxtPluginSettings {
	defaultSortOrder: SortOrder;
}

export const DEFAULT_SETTINGS: TodotxtPluginSettings = {
	defaultSortOrder: "completion",
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
			.setName("デフォルトソート順")
			.setDesc("todo.txtファイルを開いたときのデフォルトのソート順を選択します")
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
	}
}
