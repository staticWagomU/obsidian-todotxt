/**
 * Todo to Form conversion tests
 * Tests for converting Todo objects to form data for editing
 */

import { describe, expect, test } from "vitest";
import { todoToFormData } from "./todo-to-form";
import type { Todo } from "./todo";

describe("todoToFormData", () => {
	test("最小限の Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.description).toBe("Buy milk");
		expect(formData.priority).toBeUndefined();
		expect(formData.creationDate).toBeUndefined();
		expect(formData.due).toBeUndefined();
		expect(formData.threshold).toBeUndefined();
		expect(formData.projects).toEqual([]);
		expect(formData.contexts).toEqual([]);
		expect(formData.tags).toEqual({});
	});

	test("優先度を含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			description: "Important task",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.priority).toBe("A");
	});

	test("作成日を含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2025-01-01",
			description: "Task with date",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.creationDate).toBe("2025-01-01");
	});

	test("due タグを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Task with due date due:2025-01-15",
			projects: [],
			contexts: [],
			tags: { due: "2025-01-15" },
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.due).toBe("2025-01-15");
		expect(formData.description).toBe("Task with due date");
	});

	test("threshold (t:) タグを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Task with threshold t:2025-01-08",
			projects: [],
			contexts: [],
			tags: { t: "2025-01-08" },
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.threshold).toBe("2025-01-08");
		expect(formData.description).toBe("Task with threshold");
	});

	test("プロジェクトを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Task in +work +urgent",
			projects: ["work", "urgent"],
			contexts: [],
			tags: {},
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.projects).toEqual(["work", "urgent"]);
		expect(formData.description).toBe("Task in");
	});

	test("コンテキストを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Task with @home @email",
			projects: [],
			contexts: ["home", "email"],
			tags: {},
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.contexts).toEqual(["home", "email"]);
		expect(formData.description).toBe("Task with");
	});

	test("カスタムタグを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			description: "Task with priority:high status:active",
			projects: [],
			contexts: [],
			tags: { priority: "high", status: "active" },
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.tags).toEqual({ priority: "high", status: "active" });
		expect(formData.description).toBe("Task with");
	});

	test("すべてのフィールドを含む Todo から FormData を生成", () => {
		const todo: Todo = {
			completed: false,
			priority: "B",
			creationDate: "2025-01-01",
			description: "Complete task +work @office due:2025-01-15 t:2025-01-08 estimate:2h",
			projects: ["work"],
			contexts: ["office"],
			tags: { due: "2025-01-15", t: "2025-01-08", estimate: "2h" },
			raw: "",
		};

		const formData = todoToFormData(todo);
		expect(formData.description).toBe("Complete task");
		expect(formData.priority).toBe("B");
		expect(formData.creationDate).toBe("2025-01-01");
		expect(formData.due).toBe("2025-01-15");
		expect(formData.threshold).toBe("2025-01-08");
		expect(formData.projects).toEqual(["work"]);
		expect(formData.contexts).toEqual(["office"]);
		expect(formData.tags).toEqual({ estimate: "2h" });
	});
});
