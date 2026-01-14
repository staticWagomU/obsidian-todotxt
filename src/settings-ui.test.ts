import { describe, expect, it } from "vitest";
import { App } from "obsidian";
import { TodotxtSettingTab } from "./settings";

// Mock App and Plugin
class MockApp extends App {
	constructor() {
		super();
	}
}

class MockPlugin {
	app: App;
	settings = {
		defaultSortOrder: "completion" as const,
		defaultGrouping: "none" as const,
		showCompletedTasks: true,
		todotxtFilePaths: [] as string[],
	};

	constructor(app: App) {
		this.app = app;
	}

	async saveSettings() {
		// Mock save
	}
}

describe("TodotxtSettingTab", () => {
	describe("file paths UI", () => {
		it("should have textarea for file paths input", () => {
			// Create mock container element
			const container = document.createElement("div");
			
			const app = new MockApp();
			const plugin = new MockPlugin(app) as any;
			const settingTab = new TodotxtSettingTab(app, plugin);
			
			// Set container
			(settingTab as any).containerEl = container;
			
			// Display settings
			settingTab.display();
			
			// Check if textarea exists
			const textareas = container.querySelectorAll("textarea");
			expect(textareas.length).toBeGreaterThan(0);
			
			// Check if there's a setting related to file paths
			const settingNames = Array.from(container.querySelectorAll(".setting-item-name"))
				.map(el => el.textContent);
			expect(settingNames.some(name => 
				name?.includes("ファイルパス") || 
				name?.includes("file path") ||
				name?.includes("File path")
			)).toBe(true);
		});

		it("should display current file paths as newline-separated text", () => {
			const container = document.createElement("div");
			
			const app = new MockApp();
			const plugin = new MockPlugin(app) as any;
			plugin.settings.todotxtFilePaths = ["vault/todo.txt", "vault/tasks.txt"];
			
			const settingTab = new TodotxtSettingTab(app, plugin);
			(settingTab as any).containerEl = container;
			
			settingTab.display();
			
			const textarea = container.querySelector("textarea");
			expect(textarea).toBeDefined();
			expect(textarea?.value).toBe("vault/todo.txt\nvault/tasks.txt");
		});

		it("should save file paths as array when changed", async () => {
			const container = document.createElement("div");
			
			const app = new MockApp();
			const plugin = new MockPlugin(app) as any;
			let savedPaths: string[] = [];
			
			plugin.saveSettings = async () => {
				savedPaths = plugin.settings.todotxtFilePaths;
			};
			
			const settingTab = new TodotxtSettingTab(app, plugin);
			(settingTab as any).containerEl = container;
			
			settingTab.display();
			
			const textarea = container.querySelector("textarea");
			if (textarea) {
				textarea.value = "vault/todo.txt\nvault/tasks.txt\nvault/work.txt";
				textarea.dispatchEvent(new Event("input"));
				
				// Wait for async save
				await new Promise(resolve => setTimeout(resolve, 10));
				
				expect(savedPaths).toEqual([
					"vault/todo.txt",
					"vault/tasks.txt",
					"vault/work.txt"
				]);
			}
		});
	});
});
