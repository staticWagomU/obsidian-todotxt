import { describe, it, expect, beforeEach } from "vitest";
import TodotxtPlugin from "./main";
import { TodotxtSettingTab } from "./settings";
import { App, type PluginManifest } from "obsidian";

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
