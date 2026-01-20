/**
 * Template function tests
 * PBI-066: Task Template Feature
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { expandPlaceholders, parseTemplate } from "./template";

describe("expandPlaceholders", () => {
	beforeEach(() => {
		// Mock Date to return 2025-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2025, 0, 20)); // January 20, 2025
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("{{today}} placeholder", () => {
		it("should expand {{today}} to today's date in YYYY-MM-DD format", () => {
			const template = "Task due:{{today}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-01-20");
		});

		it("should expand multiple {{today}} placeholders", () => {
			const template = "Task t:{{today}} due:{{today}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task t:2025-01-20 due:2025-01-20");
		});

		it("should be case-insensitive for {{TODAY}}", () => {
			const template = "Task due:{{TODAY}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-01-20");
		});
	});

	describe("{{tomorrow}} placeholder", () => {
		it("should expand {{tomorrow}} to tomorrow's date in YYYY-MM-DD format", () => {
			const template = "Task due:{{tomorrow}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-01-21");
		});

		it("should handle month boundary correctly", () => {
			vi.setSystemTime(new Date(2025, 0, 31)); // January 31, 2025
			const template = "Task due:{{tomorrow}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-02-01");
		});

		it("should handle year boundary correctly", () => {
			vi.setSystemTime(new Date(2024, 11, 31)); // December 31, 2024
			const template = "Task due:{{tomorrow}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-01-01");
		});

		it("should be case-insensitive for {{TOMORROW}}", () => {
			const template = "Task due:{{TOMORROW}}";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task due:2025-01-21");
		});
	});

	describe("mixed placeholders", () => {
		it("should expand both {{today}} and {{tomorrow}} in the same template", () => {
			const template = "Task t:{{today}} due:{{tomorrow}} +project";
			const result = expandPlaceholders(template);
			expect(result).toBe("Task t:2025-01-20 due:2025-01-21 +project");
		});
	});

	describe("no placeholders", () => {
		it("should return the template unchanged if no placeholders", () => {
			const template = "Regular task +project @context";
			const result = expandPlaceholders(template);
			expect(result).toBe("Regular task +project @context");
		});

		it("should handle empty string", () => {
			const result = expandPlaceholders("");
			expect(result).toBe("");
		});
	});
});

describe("parseTemplate", () => {
	beforeEach(() => {
		// Mock Date to return 2025-01-20
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2025, 0, 20)); // January 20, 2025
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("single line template", () => {
		it("should return single task line from single line template", () => {
			const template = "Task +project @context";
			const result = parseTemplate(template);
			expect(result).toEqual(["Task +project @context"]);
		});

		it("should expand placeholders in single line", () => {
			const template = "Task due:{{today}}";
			const result = parseTemplate(template);
			expect(result).toEqual(["Task due:2025-01-20"]);
		});
	});

	describe("multi-line template", () => {
		it("should split multi-line template into multiple tasks", () => {
			const template = "Task 1 +project\nTask 2 +project\nTask 3 +project";
			const result = parseTemplate(template);
			expect(result).toEqual([
				"Task 1 +project",
				"Task 2 +project",
				"Task 3 +project",
			]);
		});

		it("should expand placeholders in each line", () => {
			const template = "Task 1 due:{{today}}\nTask 2 due:{{tomorrow}}";
			const result = parseTemplate(template);
			expect(result).toEqual([
				"Task 1 due:2025-01-20",
				"Task 2 due:2025-01-21",
			]);
		});

		it("should filter out empty lines", () => {
			const template = "Task 1\n\nTask 2\n\n\nTask 3";
			const result = parseTemplate(template);
			expect(result).toEqual(["Task 1", "Task 2", "Task 3"]);
		});

		it("should trim whitespace from each line", () => {
			const template = "  Task 1  \n  Task 2  ";
			const result = parseTemplate(template);
			expect(result).toEqual(["Task 1", "Task 2"]);
		});

		it("should handle Windows line endings (CRLF)", () => {
			const template = "Task 1\r\nTask 2\r\nTask 3";
			const result = parseTemplate(template);
			expect(result).toEqual(["Task 1", "Task 2", "Task 3"]);
		});
	});

	describe("edge cases", () => {
		it("should return empty array for empty template", () => {
			const result = parseTemplate("");
			expect(result).toEqual([]);
		});

		it("should return empty array for whitespace-only template", () => {
			const result = parseTemplate("   \n  \n   ");
			expect(result).toEqual([]);
		});

		it("should handle template with only empty lines", () => {
			const result = parseTemplate("\n\n\n");
			expect(result).toEqual([]);
		});
	});
});
