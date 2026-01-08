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
});
