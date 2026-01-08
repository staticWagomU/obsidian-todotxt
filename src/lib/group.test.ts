/**
 * Test suite for grouping functions
 */

import { describe, test, expect } from "vitest";
import { groupByProject } from "./group";
import type { Todo } from "./todo";

describe("groupByProject", () => {
	test("should return empty Map when input is empty array", () => {
		const todos: Todo[] = [];
		const result = groupByProject(todos);

		expect(result.size).toBe(0);
	});

	test("should group todo with single project", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task +ProjectA",
				projects: ["ProjectA"],
				contexts: [],
				tags: {},
				raw: "Task +ProjectA",
			},
		];
		const result = groupByProject(todos);

		expect(result.size).toBe(1);
		expect(result.has("ProjectA")).toBe(true);
		expect(result.get("ProjectA")).toEqual([todos[0]]);
	});
});
