import { describe, it, expect } from "vitest";
import { sortTodos } from "./sort";
import type { Todo } from "./todo";

describe("sort incomplete before completed", () => {
	it("未完了タスクのみのリストをソートできる", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 1",
			},
			{
				completed: false,
				description: "Task 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 2",
			},
		];

		const result = sortTodos(todos);

		expect(result.every(todo => !todo.completed)).toBe(true);
	});

	it("完了タスクのみのリストをソートできる", () => {
		const todos: Todo[] = [
			{
				completed: true,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x Task 1",
			},
			{
				completed: true,
				description: "Task 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x Task 2",
			},
		];

		const result = sortTodos(todos);

		expect(result.every(todo => todo.completed)).toBe(true);
	});

	it("未完了と完了が混在するリストで未完了を前に配置する", () => {
		const todos: Todo[] = [
			{
				completed: true,
				description: "Completed Task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x Completed Task",
			},
			{
				completed: false,
				description: "Incomplete Task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Incomplete Task",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].completed).toBe(false);
		expect(result[1].completed).toBe(true);
	});

	it("空配列のソートで空配列を返す", () => {
		const todos: Todo[] = [];

		const result = sortTodos(todos);

		expect(result).toEqual([]);
	});
});
