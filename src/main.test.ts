import { describe, expect, it } from "vitest";
import { shouldOpenAsTodotxt } from "./lib/file-matcher";

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
});
