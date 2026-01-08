/**
 * Test suite for grouping functions
 */

import { describe, test, expect } from "vitest";
import { groupByProject, groupByContext } from "./group";
import type { Todo } from "./todo";

/**
 * Create minimal Todo for testing
 */
function createTodo(description: string, projects: string[] = [], contexts: string[] = []): Todo {
	return {
		completed: false,
		description,
		projects,
		contexts,
		tags: {},
		raw: description,
	};
}

/**
 * Assert that a group exists and contains expected todos
 */
function expectGroupToContain(result: Map<string, Todo[]>, groupKey: string, expectedTodos: Todo[]): void {
	expect(result.has(groupKey)).toBe(true);
	expect(result.get(groupKey)).toEqual(expectedTodos);
}

describe("groupByProject", () => {
	test("should return empty Map when input is empty array", () => {
		const todos: Todo[] = [];
		const result = groupByProject(todos);

		expect(result.size).toBe(0);
	});

	test("should group todo with single project", () => {
		const todos = [createTodo("Task +ProjectA", ["ProjectA"])];
		const result = groupByProject(todos);

		expect(result.size).toBe(1);
		expectGroupToContain(result, "ProjectA", [todos[0]]);
	});

	test("should group todo with multiple projects to all corresponding groups", () => {
		const todos = [createTodo("Task +ProjectA +ProjectB", ["ProjectA", "ProjectB"])];
		const result = groupByProject(todos);

		expect(result.size).toBe(2);
		expectGroupToContain(result, "ProjectA", [todos[0]]);
		expectGroupToContain(result, "ProjectB", [todos[0]]);
	});

	test("should group todo without project to '未分類' group", () => {
		const todos = [createTodo("Task without project", [])];
		const result = groupByProject(todos);

		expect(result.size).toBe(1);
		expectGroupToContain(result, "未分類", [todos[0]]);
	});
});

describe("groupByContext", () => {
	test("should return empty Map when input is empty array", () => {
		const todos: Todo[] = [];
		const result = groupByContext(todos);

		expect(result.size).toBe(0);
	});

	test("should group todo with single context", () => {
		const todos = [createTodo("Task @Home", [], ["Home"])];
		const result = groupByContext(todos);

		expect(result.size).toBe(1);
		expectGroupToContain(result, "Home", [todos[0]]);
	});

	test("should group todo with multiple contexts to all corresponding groups", () => {
		const todos = [createTodo("Task @Home @Work", [], ["Home", "Work"])];
		const result = groupByContext(todos);

		expect(result.size).toBe(2);
		expectGroupToContain(result, "Home", [todos[0]]);
		expectGroupToContain(result, "Work", [todos[0]]);
	});

	test("should group todo without context to '未分類' group", () => {
		const todos = [createTodo("Task without context", [], [])];
		const result = groupByContext(todos);

		expect(result.size).toBe(1);
		expectGroupToContain(result, "未分類", [todos[0]]);
	});
});
