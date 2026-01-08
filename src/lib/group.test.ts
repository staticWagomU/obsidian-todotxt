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
		expect(result.has("ProjectA")).toBe(true);
		expect(result.get("ProjectA")).toEqual([todos[0]]);
	});

	test("should group todo with multiple projects to all corresponding groups", () => {
		const todos = [createTodo("Task +ProjectA +ProjectB", ["ProjectA", "ProjectB"])];
		const result = groupByProject(todos);

		expect(result.size).toBe(2);
		expect(result.has("ProjectA")).toBe(true);
		expect(result.has("ProjectB")).toBe(true);
		expect(result.get("ProjectA")).toEqual([todos[0]]);
		expect(result.get("ProjectB")).toEqual([todos[0]]);
	});

	test("should group todo without project to '未分類' group", () => {
		const todos = [createTodo("Task without project", [])];
		const result = groupByProject(todos);

		expect(result.size).toBe(1);
		expect(result.has("未分類")).toBe(true);
		expect(result.get("未分類")).toEqual([todos[0]]);
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
		expect(result.has("Home")).toBe(true);
		expect(result.get("Home")).toEqual([todos[0]]);
	});

	test("should group todo with multiple contexts to all corresponding groups", () => {
		const todos = [createTodo("Task @Home @Work", [], ["Home", "Work"])];
		const result = groupByContext(todos);

		expect(result.size).toBe(2);
		expect(result.has("Home")).toBe(true);
		expect(result.has("Work")).toBe(true);
		expect(result.get("Home")).toEqual([todos[0]]);
		expect(result.get("Work")).toEqual([todos[0]]);
	});

	test("should group todo without context to '未分類' group", () => {
		const todos = [createTodo("Task without context", [], [])];
		const result = groupByContext(todos);

		expect(result.size).toBe(1);
		expect(result.has("未分類")).toBe(true);
		expect(result.get("未分類")).toEqual([todos[0]]);
	});
});
