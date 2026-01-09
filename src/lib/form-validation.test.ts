/**
 * Form validation tests
 * Tests for task form validation logic (description required, date validation)
 */

import { describe, expect, test } from "vitest";
import { validateTaskForm, type TaskFormData, type ValidationErrors } from "./form-validation";

describe("validateTaskForm", () => {
	test("説明文が空文字列の場合、エラーを返す", () => {
		const formData: TaskFormData = {
			description: "",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.description).toBe("説明文は必須です");
	});

	test("説明文が空白のみの場合、エラーを返す", () => {
		const formData: TaskFormData = {
			description: "   ",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.description).toBe("説明文は必須です");
	});

	test("説明文が有効な場合、エラーなし", () => {
		const formData: TaskFormData = {
			description: "Buy milk",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(true);
		expect(result.errors.description).toBeUndefined();
	});

	test("無効な作成日形式の場合、エラーを返す", () => {
		const formData: TaskFormData = {
			description: "Valid task",
			creationDate: "2025-13-01", // Invalid month
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.creationDate).toBe("無効な日付形式です (YYYY-MM-DD)");
	});

	test("無効なdue日形式の場合、エラーを返す", () => {
		const formData: TaskFormData = {
			description: "Valid task",
			due: "2025/01/09", // Invalid format
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.due).toBe("無効な日付形式です (YYYY-MM-DD)");
	});

	test("無効なthreshold日形式の場合、エラーを返す", () => {
		const formData: TaskFormData = {
			description: "Valid task",
			threshold: "not-a-date",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.threshold).toBe("無効な日付形式です (YYYY-MM-DD)");
	});

	test("有効な日付形式の場合、エラーなし", () => {
		const formData: TaskFormData = {
			description: "Valid task",
			creationDate: "2025-01-09",
			due: "2025-01-10",
			threshold: "2025-01-08",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(true);
		expect(result.errors.creationDate).toBeUndefined();
		expect(result.errors.due).toBeUndefined();
		expect(result.errors.threshold).toBeUndefined();
	});

	test("日付が未指定の場合、エラーなし", () => {
		const formData: TaskFormData = {
			description: "Valid task",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(true);
		expect(result.errors.creationDate).toBeUndefined();
		expect(result.errors.due).toBeUndefined();
		expect(result.errors.threshold).toBeUndefined();
	});

	test("複数のバリデーションエラーがある場合、すべてのエラーを返す", () => {
		const formData: TaskFormData = {
			description: "",
			creationDate: "invalid-date",
			due: "2025-13-01",
		};

		const result = validateTaskForm(formData);
		expect(result.valid).toBe(false);
		expect(result.errors.description).toBe("説明文は必須です");
		expect(result.errors.creationDate).toBe("無効な日付形式です (YYYY-MM-DD)");
		expect(result.errors.due).toBe("無効な日付形式です (YYYY-MM-DD)");
	});
});
