import { describe, expect, it } from "vitest";
import { shouldOpenAsTodotxt } from "./lib/file-matcher";
import { shouldSwitchToTodotxtView } from "./lib/file-matcher";

describe("main integration", () => {
	describe("file path matching with settings", () => {
		it("should use default extension matching when no paths specified", () => {
			const settings = { todotxtFilePaths: [] };

			expect(shouldOpenAsTodotxt("vault/todo.txt", settings.todotxtFilePaths)).toBe(true);
			expect(shouldOpenAsTodotxt("vault/notes.md", settings.todotxtFilePaths)).toBe(false);
		});

		it("should use specified paths when configured", () => {
			const settings = { todotxtFilePaths: ["vault/todo.txt", "work/tasks.txt"] };

			expect(shouldOpenAsTodotxt("vault/todo.txt", settings.todotxtFilePaths)).toBe(true);
			expect(shouldOpenAsTodotxt("work/tasks.txt", settings.todotxtFilePaths)).toBe(true);
			expect(shouldOpenAsTodotxt("vault/other.txt", settings.todotxtFilePaths)).toBe(false);
		});
	});

	describe("file-open event: .md view switching", () => {
		it("should switch to todotxt view when .md file is in todotxtFilePaths", () => {
			const todotxtFilePaths = ["vault/todo.md", "vault/tasks.txt"];

			expect(shouldSwitchToTodotxtView("vault/todo.md", "md", todotxtFilePaths)).toBe(true);
		});

		it("should not switch view for .md file not in todotxtFilePaths", () => {
			const todotxtFilePaths = ["vault/tasks.txt"];

			expect(shouldSwitchToTodotxtView("vault/notes.md", "md", todotxtFilePaths)).toBe(false);
		});

		it("should not switch view for non-.md files (handled by registerExtensions)", () => {
			const todotxtFilePaths = ["vault/todo.txt"];

			expect(shouldSwitchToTodotxtView("vault/todo.txt", "txt", todotxtFilePaths)).toBe(false);
		});

		it("should not switch view when todotxtFilePaths is empty", () => {
			const todotxtFilePaths: string[] = [];

			expect(shouldSwitchToTodotxtView("vault/notes.md", "md", todotxtFilePaths)).toBe(false);
		});
	});
});
