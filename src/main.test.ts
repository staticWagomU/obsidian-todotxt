import { describe, it, expect, beforeEach } from "vitest";
import TodotxtPlugin from "./main";
import { App, type PluginManifest } from "obsidian";

describe("TodotxtView registration", () => {
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

	it("should register TodotxtView when plugin loads", async () => {
		const registerViewSpy = { called: false, viewType: "" };

		plugin.registerView = (viewType: string) => {
			registerViewSpy.called = true;
			registerViewSpy.viewType = viewType;
		};

		await plugin.onload();

		expect(registerViewSpy.called).toBe(true);
		expect(registerViewSpy.viewType).toBe("todotxt-view");
	});

	it("should register .txt extension", async () => {
		const extensionsSpy: { extensions: string[]; viewType: string }[] = [];

		plugin.registerExtensions = (extensions: string[], viewType: string) => {
			extensionsSpy.push({ extensions, viewType });
		};

		await plugin.onload();

		const txtRegistration = extensionsSpy.find(
			(reg) => reg.extensions.includes("txt")
		);
		expect(txtRegistration).toBeDefined();
		expect(txtRegistration?.viewType).toBe("todotxt-view");
	});

	it("should register .todotxt extension", async () => {
		const extensionsSpy: { extensions: string[]; viewType: string }[] = [];

		plugin.registerExtensions = (extensions: string[], viewType: string) => {
			extensionsSpy.push({ extensions, viewType });
		};

		await plugin.onload();

		const todotxtRegistration = extensionsSpy.find(
			(reg) => reg.extensions.includes("todotxt")
		);
		expect(todotxtRegistration).toBeDefined();
		expect(todotxtRegistration?.viewType).toBe("todotxt-view");
	});
});
