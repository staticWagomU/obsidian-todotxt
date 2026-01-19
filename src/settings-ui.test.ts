import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";
import type { TodotxtPluginSettings } from "./settings";
import { DEFAULT_SHORTCUTS } from "./lib/shortcuts";

describe("TodotxtSettingTab", () => {
	describe("file paths setting", () => {
		it("should include todotxtFilePaths in settings interface", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				todotxtFilePaths: ["vault/todo.txt", "vault/tasks.txt"],
			};

			expect(settings.todotxtFilePaths).toEqual(["vault/todo.txt", "vault/tasks.txt"]);
		});

		it("should handle newline-separated paths conversion to array", () => {
			const pathsText = "vault/todo.txt\nvault/tasks.txt\nvault/work.txt";
			const pathsArray = pathsText
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			expect(pathsArray).toEqual([
				"vault/todo.txt",
				"vault/tasks.txt",
				"vault/work.txt"
			]);
		});

		it("should handle array to newline-separated text conversion", () => {
			const pathsArray = ["vault/todo.txt", "vault/tasks.txt"];
			const pathsText = pathsArray.join("\n");

			expect(pathsText).toBe("vault/todo.txt\nvault/tasks.txt");
		});

		it("should filter out empty lines", () => {
			const pathsText = "vault/todo.txt\n\nvault/tasks.txt\n  \nvault/work.txt";
			const pathsArray = pathsText
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			expect(pathsArray).toEqual([
				"vault/todo.txt",
				"vault/tasks.txt",
				"vault/work.txt"
			]);
		});
	});

	describe("keyboard shortcuts section", () => {
		it("should have shortcut definitions for display", () => {
			expect(DEFAULT_SHORTCUTS).toBeDefined();
			expect(Array.isArray(DEFAULT_SHORTCUTS)).toBe(true);
		});

		it("should include new task shortcut", () => {
			const newTaskShortcut = DEFAULT_SHORTCUTS.find(s => s.key.includes("N"));
			expect(newTaskShortcut).toBeDefined();
			expect(newTaskShortcut?.description).toContain("タスク");
		});

		it("should include search focus shortcut", () => {
			const searchShortcut = DEFAULT_SHORTCUTS.find(s => s.key.includes("F"));
			expect(searchShortcut).toBeDefined();
			expect(searchShortcut?.description).toContain("検索");
		});

		it("should include navigation shortcuts", () => {
			const upShortcut = DEFAULT_SHORTCUTS.find(s => s.key === "ArrowUp");
			const downShortcut = DEFAULT_SHORTCUTS.find(s => s.key === "ArrowDown");
			expect(upShortcut).toBeDefined();
			expect(downShortcut).toBeDefined();
		});

		it("should include action shortcuts", () => {
			const enterShortcut = DEFAULT_SHORTCUTS.find(s => s.key === "Enter");
			const editShortcut = DEFAULT_SHORTCUTS.find(s => s.key === "E");
			const deleteShortcut = DEFAULT_SHORTCUTS.find(s => s.key === "Delete");
			expect(enterShortcut).toBeDefined();
			expect(editShortcut).toBeDefined();
			expect(deleteShortcut).toBeDefined();
		});
	});
});
