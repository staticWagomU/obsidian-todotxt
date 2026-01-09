import { describe, it, expect, beforeEach } from "vitest";
import TodotxtPlugin from "./main";
import { TodotxtSettingTab, DEFAULT_SETTINGS } from "./settings";
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

	it("should create dropdown for sort order selection", () => {
		const containerEl = document.createElement("div");
		settingTab.containerEl = containerEl;

		const addedSettings: { name: string; desc: string }[] = [];
		const mockSetting = {
			setName: function (name: string) {
				addedSettings.push({ name, desc: "" });
				return this;
			},
			setDesc: function (desc: string) {
				if (addedSettings.length > 0) {
					addedSettings[addedSettings.length - 1].desc = desc;
				}
				return this;
			},
			addDropdown: function () {
				return this;
			},
		};

		// Mock Setting constructor
		const OriginalSetting = Setting;
		(global as { Setting?: typeof Setting }).Setting = function (el: HTMLElement) {
			return mockSetting as Setting;
		} as typeof Setting;

		settingTab.display();

		// Restore original Setting
		(global as { Setting?: typeof Setting }).Setting = OriginalSetting;

		const sortSetting = addedSettings.find((s) => s.name.includes("ソート順"));
		expect(sortSetting).toBeDefined();
	});

	it("should update settings.defaultSortOrder when dropdown value changes", async () => {
		let onChangeCallback: ((value: string) => void) | null = null;

		const mockDropdown = {
			addOption: function () {
				return this;
			},
			setValue: function () {
				return this;
			},
			onChange: function (callback: (value: string) => void) {
				onChangeCallback = callback;
				return this;
			},
		};

		const mockSetting = {
			setName: function () {
				return this;
			},
			setDesc: function () {
				return this;
			},
			addDropdown: function (cb: (dropdown: typeof mockDropdown) => void) {
				cb(mockDropdown);
				return this;
			},
		};

		const OriginalSetting = Setting;
		(global as { Setting?: typeof Setting }).Setting = function () {
			return mockSetting as Setting;
		} as typeof Setting;

		const containerEl = document.createElement("div");
		settingTab.containerEl = containerEl;
		settingTab.display();

		(global as { Setting?: typeof Setting }).Setting = OriginalSetting;

		expect(onChangeCallback).not.toBeNull();
		if (onChangeCallback) {
			onChangeCallback("priority");
			expect(plugin.settings.defaultSortOrder).toBe("priority");
		}
	});
});
