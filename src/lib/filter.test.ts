import { describe, expect, it } from "vitest";
import type { Todo } from "./todo";
import { filterByPriority } from "./filter";

describe("filterByPriority", () => {
	describe("filter by specific priority", () => {
		it("should return only tasks with priority A when filtering by A", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "High priority task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) High priority task",
				},
				{
					completed: false,
					priority: "B",
					description: "Medium priority task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Medium priority task",
				},
				{
					completed: false,
					description: "No priority task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "No priority task",
				},
			];

			const result = filterByPriority(todos, "A");

			expect(result).toHaveLength(1);
			expect(result[0]?.priority).toBe("A");
			expect(result[0]?.description).toBe("High priority task");
		});

		it("should exclude tasks with different priorities", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "Priority A",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Priority A",
				},
				{
					completed: false,
					priority: "B",
					description: "Priority B",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Priority B",
				},
				{
					completed: false,
					priority: "C",
					description: "Priority C",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(C) Priority C",
				},
			];

			const result = filterByPriority(todos, "B");

			expect(result).toHaveLength(1);
			expect(result[0]?.priority).toBe("B");
			// Verify that A and C are excluded
			expect(result.every(todo => todo.priority !== "A")).toBe(true);
			expect(result.every(todo => todo.priority !== "C")).toBe(true);
		});
	});
});
