import { App, PluginSettingTab, Setting } from "obsidian";
import type TodotxtPlugin from "./main";
import type { RetryConfig } from "./ai/retry";
import { DEFAULT_SHORTCUTS, formatShortcutKey } from "./lib/shortcuts";
import type { FilterPreset } from "./lib/filter-preset";
import type { FilterState } from "./lib/rendering";

export type SortOrder = "completion" | "priority" | "date" | "alphabetical";
export type Grouping = "none" | "project" | "context";

export interface OpenRouterSettings {
	apiKey: string;
	model: string;
	includeCreationDate: boolean;
	customContexts: Record<string, string>;
	retryConfig: RetryConfig;
}

export interface TodotxtPluginSettings {
	defaultSortOrder: SortOrder;
	defaultGrouping: Grouping;
	showCompletedTasks: boolean;
	todotxtFilePaths: string[];
	openRouter: OpenRouterSettings;
	/** Saved filter presets */
	savedFilters: FilterPreset[];
	/** File path to preset id mapping for default filters */
	fileDefaultFilters: Record<string, string>;
	/** Custom keyboard shortcuts (shortcut id -> custom key) */
	customShortcuts: Record<string, string>;
}

export const DEFAULT_SETTINGS: TodotxtPluginSettings = {
	defaultSortOrder: "completion",
	defaultGrouping: "none",
	showCompletedTasks: true,
	todotxtFilePaths: [],
	openRouter: {
		apiKey: "",
		model: "anthropic/claude-3-haiku",
		includeCreationDate: true,
		customContexts: {},
		retryConfig: {
			enabled: true,
			maxRetries: 3,
			initialDelayMs: 1000,
		},
	},
	savedFilters: [],
	fileDefaultFilters: {},
	customShortcuts: {},
};

/**
 * Get the default filter state for a specific file
 *
 * @param settings - Plugin settings containing savedFilters and fileDefaultFilters
 * @param filePath - Path of the file to get default filter for
 * @returns The default filter state if found, undefined otherwise
 */
export function getDefaultFilterForFile(
	settings: TodotxtPluginSettings,
	filePath: string,
): FilterState | undefined {
	const presetId = settings.fileDefaultFilters[filePath];
	if (!presetId) {
		return undefined;
	}

	const preset = settings.savedFilters.find(p => p.id === presetId);
	if (!preset) {
		return undefined;
	}

	return preset.filterState;
}

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

		new Setting(containerEl)
			.setName("Todo.txtファイルパス")
			.setDesc("Todo.txtとして扱うファイルのパスを指定します（複数行で指定可能）。未指定の場合は.txt/.todotxt拡張子のファイルをすべて対象とします")
			.addTextArea((text) =>
				text
					.setPlaceholder("vault/todo.txt\nvault/tasks.txt")
					.setValue(this.plugin.settings.todotxtFilePaths.join("\n"))
					.onChange(async (value) => {
						// Split by newline and filter empty lines
						this.plugin.settings.todotxtFilePaths = value
							.split("\n")
							.map((line) => line.trim())
							.filter((line) => line.length > 0);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("AI task addition").setHeading();

		new Setting(containerEl)
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			.setName("OpenRouter API key")
			.setDesc("Get your API key at https://openrouter.ai")
			.addText((text) =>
				text
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.setPlaceholder("sk-or-...")
					.setValue(this.plugin.settings.openRouter.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.openRouter.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Model")
			.setDesc("Select the AI model to use for task conversion")
			.addDropdown((dropdown) =>
				dropdown
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.addOption("anthropic/claude-3-haiku", "Claude 3 Haiku")
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.addOption("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet")
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.addOption("openai/gpt-4o-mini", "GPT-4o Mini")
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					.addOption("google/gemini-flash-1.5", "Gemini Flash 1.5")
					.setValue(this.plugin.settings.openRouter.model)
					.onChange(async (value) => {
						this.plugin.settings.openRouter.model = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include creation date")
			.setDesc("Automatically add creation date to generated tasks")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openRouter.includeCreationDate)
					.onChange(async (value) => {
						this.plugin.settings.openRouter.includeCreationDate = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto retry on error")
			.setDesc("Automatically retry API requests on network errors")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openRouter.retryConfig.enabled)
					.onChange(async (value) => {
						this.plugin.settings.openRouter.retryConfig.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Max retries")
			.setDesc("Maximum number of retry attempts")
			.addText((text) =>
				text
					.setPlaceholder("3")
					.setValue(String(this.plugin.settings.openRouter.retryConfig.maxRetries))
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed) && parsed >= 0) {
							this.plugin.settings.openRouter.retryConfig.maxRetries = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Retry delay (ms)")
			.setDesc("Initial delay before first retry (will increase exponentially)")
			.addText((text) =>
				text
					.setPlaceholder("1000")
					.setValue(String(this.plugin.settings.openRouter.retryConfig.initialDelayMs))
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (!isNaN(parsed) && parsed >= 0) {
							this.plugin.settings.openRouter.retryConfig.initialDelayMs = parsed;
							await this.plugin.saveSettings();
						}
					})
			);

		// Keyboard shortcuts section
		new Setting(containerEl).setName("Keyboard shortcuts").setHeading();

		// Group shortcuts by category
		const navigationShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === "navigation");
		const actionShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === "action");
		const globalShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === "global");

		// Navigation shortcuts
		new Setting(containerEl).setName("ナビゲーション").setHeading();
		for (const shortcut of navigationShortcuts) {
			new Setting(containerEl)
				.setName(formatShortcutKey(shortcut.key))
				.setDesc(shortcut.description);
		}

		// Action shortcuts
		new Setting(containerEl).setName("アクション").setHeading();
		for (const shortcut of actionShortcuts) {
			new Setting(containerEl)
				.setName(formatShortcutKey(shortcut.key))
				.setDesc(shortcut.description);
		}

		// Global shortcuts
		new Setting(containerEl).setName("グローバル（コマンドパレット）").setHeading();
		for (const shortcut of globalShortcuts) {
			new Setting(containerEl)
				.setName(formatShortcutKey(shortcut.key))
				.setDesc(shortcut.description);
		}
	}
}
