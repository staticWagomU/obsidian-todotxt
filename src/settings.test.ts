import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";
import type { TodotxtPluginSettings } from "./settings";

describe("TodotxtPluginSettings", () => {
	describe("todotxtFilePaths", () => {
		it("should have todotxtFilePaths property in settings interface", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				todotxtFilePaths: [],
			};
			expect(settings.todotxtFilePaths).toBeDefined();
		});

		it("should default to empty array", () => {
			expect(DEFAULT_SETTINGS.todotxtFilePaths).toEqual([]);
		});

		it("should accept array of strings", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				todotxtFilePaths: ["path/to/todo.txt", "another/path.txt"],
			};
			expect(settings.todotxtFilePaths).toHaveLength(2);
			expect(settings.todotxtFilePaths[0]).toBe("path/to/todo.txt");
		});
	});
});
