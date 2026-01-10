import { describe, expect, it } from "vitest";
import { formatDateForInput, parseDateFromInput } from "./date-picker-utils";

describe("date-picker-utils", () => {
	describe("formatDateForInput", () => {
		it("should format Date object to YYYY-MM-DD string", () => {
			const date = new Date(2026, 0, 10); // January 10, 2026
			expect(formatDateForInput(date)).toBe("2026-01-10");
		});

		it("should handle single digit months and days with zero padding", () => {
			const date = new Date(2026, 2, 5); // March 5, 2026
			expect(formatDateForInput(date)).toBe("2026-03-05");
		});

		it("should return empty string for null input", () => {
			expect(formatDateForInput(null)).toBe("");
		});
	});

	describe("parseDateFromInput", () => {
		it("should parse YYYY-MM-DD string to Date object", () => {
			const result = parseDateFromInput("2026-01-10");
			expect(result).toBeInstanceOf(Date);
			expect(result?.getFullYear()).toBe(2026);
			expect(result?.getMonth()).toBe(0); // January = 0
			expect(result?.getDate()).toBe(10);
		});

		it("should return null for invalid date format", () => {
			expect(parseDateFromInput("2026/01/10")).toBeNull();
			expect(parseDateFromInput("01-10-2026")).toBeNull();
			expect(parseDateFromInput("invalid")).toBeNull();
		});

		it("should return null for invalid dates like 2026-13-01", () => {
			expect(parseDateFromInput("2026-13-01")).toBeNull();
		});

		it("should return null for invalid dates like 2026-02-30", () => {
			expect(parseDateFromInput("2026-02-30")).toBeNull();
		});

		it("should return null for empty string", () => {
			expect(parseDateFromInput("")).toBeNull();
		});
	});
});
