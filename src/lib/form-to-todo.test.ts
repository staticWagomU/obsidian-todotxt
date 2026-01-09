/**
 * Form to Todo conversion tests
 * Tests for converting form data to Todo objects
 */

import { describe, expect, test } from "vitest";
import { formDataToTodo } from "./form-to-todo";
import type { TaskFormData } from "./form-validation";

describe("formDataToTodo", () => {
	test("最小限のフォームデータ (description のみ) から Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Buy milk",
		};

		const todo = formDataToTodo(formData);
		expect(todo.description).toBe("Buy milk");
		expect(todo.completed).toBe(false);
		expect(todo.priority).toBeUndefined();
		expect(todo.creationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Today's date
		expect(todo.projects).toEqual([]);
		expect(todo.contexts).toEqual([]);
		expect(todo.tags).toEqual({});
	});

	test("優先度を含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Important task",
			priority: "A",
		};

		const todo = formDataToTodo(formData);
		expect(todo.description).toBe("Important task");
		expect(todo.priority).toBe("A");
	});

	test("作成日を含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task with creation date",
			creationDate: "2025-01-01",
		};

		const todo = formDataToTodo(formData);
		expect(todo.creationDate).toBe("2025-01-01");
	});

	test("due タグを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task with due date",
			due: "2025-01-15",
		};

		const todo = formDataToTodo(formData);
		expect(todo.tags.due).toBe("2025-01-15");
		expect(todo.description).toBe("Task with due date due:2025-01-15");
	});

	test("threshold タグを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task with threshold",
			threshold: "2025-01-08",
		};

		const todo = formDataToTodo(formData);
		expect(todo.tags.t).toBe("2025-01-08");
		expect(todo.description).toBe("Task with threshold t:2025-01-08");
	});

	test("プロジェクトを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task in project",
			projects: ["work", "urgent"],
		};

		const todo = formDataToTodo(formData);
		expect(todo.projects).toEqual(["work", "urgent"]);
		expect(todo.description).toContain("+work");
		expect(todo.description).toContain("+urgent");
	});

	test("コンテキストを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task with context",
			contexts: ["home", "email"],
		};

		const todo = formDataToTodo(formData);
		expect(todo.contexts).toEqual(["home", "email"]);
		expect(todo.description).toContain("@home");
		expect(todo.description).toContain("@email");
	});

	test("カスタムタグを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Task with tags",
			tags: { priority: "high", status: "active" },
		};

		const todo = formDataToTodo(formData);
		expect(todo.tags).toEqual({ priority: "high", status: "active" });
		expect(todo.description).toContain("priority:high");
		expect(todo.description).toContain("status:active");
	});

	test("すべてのフィールドを含むフォームデータから Todo を生成", () => {
		const formData: TaskFormData = {
			description: "Complete task",
			priority: "B",
			creationDate: "2025-01-01",
			due: "2025-01-15",
			threshold: "2025-01-08",
			projects: ["work"],
			contexts: ["office"],
			tags: { estimate: "2h" },
		};

		const todo = formDataToTodo(formData);
		expect(todo.priority).toBe("B");
		expect(todo.creationDate).toBe("2025-01-01");
		expect(todo.tags.due).toBe("2025-01-15");
		expect(todo.tags.t).toBe("2025-01-08");
		expect(todo.tags.estimate).toBe("2h");
		expect(todo.projects).toEqual(["work"]);
		expect(todo.contexts).toEqual(["office"]);
		expect(todo.description).toContain("Complete task");
		expect(todo.description).toContain("+work");
		expect(todo.description).toContain("@office");
		expect(todo.description).toContain("due:2025-01-15");
		expect(todo.description).toContain("t:2025-01-08");
		expect(todo.description).toContain("estimate:2h");
	});
});
