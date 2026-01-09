import { describe, it, expect, beforeEach } from "vitest";
import TodotxtPlugin from "./main";
import { TodotxtSettingTab, DEFAULT_SETTINGS, type SortOrder } from "./settings";
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
