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

describe("sort by priority", () => {
	it("優先度A→B→C→Zの順でソートする", () => {
		const todos: Todo[] = [
			{
				completed: false,
				priority: "Z",
				description: "Task Z",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(Z) Task Z",
			},
			{
				completed: false,
				priority: "B",
				description: "Task B",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(B) Task B",
			},
			{
				completed: false,
				priority: "A",
				description: "Task A",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) Task A",
			},
			{
				completed: false,
				priority: "C",
				description: "Task C",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(C) Task C",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].priority).toBe("A");
		expect(result[1].priority).toBe("B");
		expect(result[2].priority).toBe("C");
		expect(result[3].priority).toBe("Z");
	});

	it("優先度なしタスクを最後に配置する", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task without priority",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task without priority",
			},
			{
				completed: false,
				priority: "A",
				description: "Task A",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) Task A",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].priority).toBe("A");
		expect(result[1].priority).toBeUndefined();
	});

	it("同優先度内でテキスト辞書順にソートする", () => {
		const todos: Todo[] = [
			{
				completed: false,
				priority: "A",
				description: "bbb",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) bbb",
			},
			{
				completed: false,
				priority: "A",
				description: "aaa",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) aaa",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].description).toBe("aaa");
		expect(result[1].description).toBe("bbb");
	});

	it("優先度ありと優先度なしが混在する未完了タスクをソートする", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "No priority 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "No priority 2",
			},
			{
				completed: false,
				priority: "B",
				description: "Task B",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(B) Task B",
			},
			{
				completed: false,
				description: "No priority 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "No priority 1",
			},
			{
				completed: false,
				priority: "A",
				description: "Task A",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) Task A",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].priority).toBe("A");
		expect(result[1].priority).toBe("B");
		expect(result[2].priority).toBeUndefined();
		expect(result[2].description).toBe("No priority 1");
		expect(result[3].priority).toBeUndefined();
		expect(result[3].description).toBe("No priority 2");
	});

	it("完了タスクも優先度とテキストでソートする", () => {
		const todos: Todo[] = [
			{
				completed: true,
				priority: "B",
				description: "Completed B",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x (B) Completed B",
			},
			{
				completed: true,
				priority: "A",
				description: "Completed A",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x (A) Completed A",
			},
		];

		const result = sortTodos(todos);

		expect(result[0].priority).toBe("A");
		expect(result[1].priority).toBe("B");
	});
});
