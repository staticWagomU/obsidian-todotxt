import { describe, it, expect, beforeEach } from "vitest";
import MyPlugin from "./main";
import { App } from "obsidian";

describe("TodotxtView registration", () => {
	let plugin: MyPlugin;
	let mockApp: App;

	beforeEach(() => {
		mockApp = {} as App;
		plugin = new MyPlugin(mockApp, {} as any);
	});

	it("should register TodotxtView when plugin loads", async () => {
		const registerViewSpy = { called: false, viewType: "" };

		plugin.registerView = (viewType: string, _viewCreator: any) => {
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
});
