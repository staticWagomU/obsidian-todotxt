import { describe, expect, it } from "vitest";
import { shouldOpenAsTodotxt } from "./file-matcher";

describe("file-matcher", () => {
	describe("shouldOpenAsTodotxt", () => {
		describe("when file paths are specified", () => {
			it("should return true if file path matches specified paths", () => {
				const filePaths = ["vault/todo.txt", "vault/tasks.txt"];
				expect(shouldOpenAsTodotxt("vault/todo.txt", filePaths)).toBe(true);
				expect(shouldOpenAsTodotxt("vault/tasks.txt", filePaths)).toBe(true);
			});

			it("should return false if file path does not match specified paths", () => {
				const filePaths = ["vault/todo.txt"];
				expect(shouldOpenAsTodotxt("vault/other.txt", filePaths)).toBe(false);
			});

			it("should handle non-existent paths gracefully", () => {
				const filePaths = ["vault/nonexistent.txt"];
				expect(shouldOpenAsTodotxt("vault/todo.txt", filePaths)).toBe(false);
			});
		});

		describe("when file paths are not specified", () => {
			it("should return true for .txt extension", () => {
				expect(shouldOpenAsTodotxt("vault/todo.txt", [])).toBe(true);
			});

			it("should return true for .todotxt extension", () => {
				expect(shouldOpenAsTodotxt("vault/todo.todotxt", [])).toBe(true);
			});

			it("should return false for other extensions", () => {
				expect(shouldOpenAsTodotxt("vault/document.md", [])).toBe(false);
			});
		});
	});
});
