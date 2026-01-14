import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";
import type { TodotxtPluginSettings } from "./settings";

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
});
