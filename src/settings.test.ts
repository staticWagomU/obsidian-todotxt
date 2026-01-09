import { describe, it, expect, beforeEach } from "vitest";
import TodotxtPlugin from "./main";
import { TodotxtSettingTab, DEFAULT_SETTINGS, type SortOrder, type Grouping } from "./settings";
import { App, type PluginManifest, Setting } from "obsidian";

describe("settings tab registration", () => {
	let plugin: TodotxtPlugin;
	let mockApp: App;
	const mockManifest: PluginManifest = {
		id: "obsidian-todotxt",
		name: "Todo.txt Plugin",
		version: "1.0.0",
		minAppVersion: "0.15.0",
		description: "Todo.txt format support for Obsidian",
		author: "wagomu",
		authorUrl: "",
		isDesktopOnly: false,
	};

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new TodotxtPlugin(mockApp, mockManifest);
	});

	it("should register TodotxtSettingTab when plugin loads", async () => {
		const addSettingTabSpy = { called: false, tab: null as unknown };

		plugin.addSettingTab = (tab: unknown) => {
			addSettingTabSpy.called = true;
			addSettingTabSpy.tab = tab;
		};

		await plugin.onload();

		expect(addSettingTabSpy.called).toBe(true);
		expect(addSettingTabSpy.tab).toBeInstanceOf(TodotxtSettingTab);
	});
});

describe("default sort setting", () => {
	let plugin: TodotxtPlugin;
	let settingTab: TodotxtSettingTab;
	let mockApp: App;
	const mockManifest: PluginManifest = {
		id: "obsidian-todotxt",
		name: "Todo.txt Plugin",
		version: "1.0.0",
		minAppVersion: "0.15.0",
		description: "Todo.txt format support for Obsidian",
		author: "wagomu",
		authorUrl: "",
		isDesktopOnly: false,
	};

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new TodotxtPlugin(mockApp, mockManifest);
		plugin.settings = { ...DEFAULT_SETTINGS };
		settingTab = new TodotxtSettingTab(mockApp, plugin);
	});

	it("should have defaultSortOrder property in settings", () => {
		expect(plugin.settings).toHaveProperty("defaultSortOrder");
	});

	it("should have 'completion' as default sort order", () => {
		expect(DEFAULT_SETTINGS.defaultSortOrder).toBe("completion");
	});

	it("should support all four sort order options", () => {
		const validOrders: SortOrder[] = ["completion", "priority", "date", "alphabetical"];
		validOrders.forEach((order) => {
			plugin.settings.defaultSortOrder = order;
			expect(plugin.settings.defaultSortOrder).toBe(order);
		});
	});

	it("should have display method that creates UI", () => {
		// Verify that the display method exists and is callable
		// UI integration testing is deferred to manual testing
		expect(typeof settingTab.display).toBe("function");
	});
});

describe("default grouping setting", () => {
	let plugin: TodotxtPlugin;
	let settingTab: TodotxtSettingTab;
	let mockApp: App;
	const mockManifest: PluginManifest = {
		id: "obsidian-todotxt",
		name: "Todo.txt Plugin",
		version: "1.0.0",
		minAppVersion: "0.15.0",
		description: "Todo.txt format support for Obsidian",
		author: "wagomu",
		authorUrl: "",
		isDesktopOnly: false,
	};

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new TodotxtPlugin(mockApp, mockManifest);
		plugin.settings = { ...DEFAULT_SETTINGS };
		settingTab = new TodotxtSettingTab(mockApp, plugin);
	});

	it("should have defaultGrouping property in settings", () => {
		expect(plugin.settings).toHaveProperty("defaultGrouping");
	});

	it("should have 'none' as default grouping", () => {
		expect(DEFAULT_SETTINGS.defaultGrouping).toBe("none");
	});

	it("should support all three grouping options", () => {
		const validGroupings: Grouping[] = ["none", "project", "context"];
		validGroupings.forEach((grouping) => {
			plugin.settings.defaultGrouping = grouping;
			expect(plugin.settings.defaultGrouping).toBe(grouping);
		});
	});
});

describe("completed tasks visibility setting", () => {
	let plugin: TodotxtPlugin;
	let settingTab: TodotxtSettingTab;
	let mockApp: App;
	const mockManifest: PluginManifest = {
		id: "obsidian-todotxt",
		name: "Todo.txt Plugin",
		version: "1.0.0",
		minAppVersion: "0.15.0",
		description: "Todo.txt format support for Obsidian",
		author: "wagomu",
		authorUrl: "",
		isDesktopOnly: false,
	};

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new TodotxtPlugin(mockApp, mockManifest);
		plugin.settings = { ...DEFAULT_SETTINGS };
		settingTab = new TodotxtSettingTab(mockApp, plugin);
	});

	it("should have showCompletedTasks property in settings", () => {
		expect(plugin.settings).toHaveProperty("showCompletedTasks");
	});

	it("should have 'true' as default for showing completed tasks", () => {
		expect(DEFAULT_SETTINGS.showCompletedTasks).toBe(true);
	});

	it("should support toggling completed tasks visibility", () => {
		plugin.settings.showCompletedTasks = false;
		expect(plugin.settings.showCompletedTasks).toBe(false);

		plugin.settings.showCompletedTasks = true;
		expect(plugin.settings.showCompletedTasks).toBe(true);
	});
});

describe("settings persistence", () => {
	let plugin: TodotxtPlugin;
	let mockApp: App;
	const mockManifest: PluginManifest = {
		id: "obsidian-todotxt",
		name: "Todo.txt Plugin",
		version: "1.0.0",
		minAppVersion: "0.15.0",
		description: "Todo.txt format support for Obsidian",
		author: "wagomu",
		authorUrl: "",
		isDesktopOnly: false,
	};

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new TodotxtPlugin(mockApp, mockManifest);
	});

	it("should load default settings when no saved data exists", async () => {
		plugin.loadData = async () => null;
		await plugin.loadSettings();

		expect(plugin.settings.defaultSortOrder).toBe("completion");
		expect(plugin.settings.defaultGrouping).toBe("none");
		expect(plugin.settings.showCompletedTasks).toBe(true);
	});

	it("should merge saved data with default settings on load", async () => {
		plugin.loadData = async () => ({
			defaultSortOrder: "priority",
		});
		await plugin.loadSettings();

		expect(plugin.settings.defaultSortOrder).toBe("priority");
		expect(plugin.settings.defaultGrouping).toBe("none"); // default
		expect(plugin.settings.showCompletedTasks).toBe(true); // default
	});

	it("should persist all settings when saveSettings is called", async () => {
		let savedData: Partial<TodotxtPluginSettings> | null = null;
		plugin.saveData = async (data: Partial<TodotxtPluginSettings>) => {
			savedData = data;
		};

		plugin.settings = {
			defaultSortOrder: "date",
			defaultGrouping: "project",
			showCompletedTasks: false,
		};
		await plugin.saveSettings();

		expect(savedData).toEqual({
			defaultSortOrder: "date",
			defaultGrouping: "project",
			showCompletedTasks: false,
		});
	});
});
