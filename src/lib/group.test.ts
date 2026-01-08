/**
 * Test suite for grouping functions
 */

import { describe, test, expect } from "vitest";
import { groupByProject } from "./group";
import type { Todo } from "./todo";

describe("groupByProject", () => {
	test("空配列入力時は空Mapを返す", () => {
		const todos: Todo[] = [];
		const result = groupByProject(todos);
		
		expect(result.size).toBe(0);
	});
});
