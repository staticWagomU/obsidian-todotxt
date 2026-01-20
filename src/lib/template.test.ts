/**
 * Template function tests
 * PBI-066: Task Template Feature
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { expandPlaceholders } from "./template";

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
