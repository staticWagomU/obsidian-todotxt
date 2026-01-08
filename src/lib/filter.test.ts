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

	describe("filter tasks without priority", () => {
		it("should return only tasks without priority when filtering by null", () => {
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
					description: "No priority task 1",
					projects: [],
					contexts: [],
					tags: {},
					raw: "No priority task 1",
				},
				{
					completed: false,
					description: "No priority task 2",
					projects: [],
					contexts: [],
					tags: {},
					raw: "No priority task 2",
				},
			];

			const result = filterByPriority(todos, null);

			expect(result).toHaveLength(2);
			expect(result[0]?.priority).toBeUndefined();
			expect(result[1]?.priority).toBeUndefined();
			expect(result[0]?.description).toBe("No priority task 1");
			expect(result[1]?.description).toBe("No priority task 2");
		});

		it("should return only tasks without priority when filtering by undefined", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "B",
					description: "Priority B task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Priority B task",
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

			const result = filterByPriority(todos, undefined);

			expect(result).toHaveLength(1);
			expect(result[0]?.priority).toBeUndefined();
			expect(result[0]?.description).toBe("No priority task");
		});
	});

	describe("filter immutability", () => {
		it("should not modify the original array when filtering", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "Priority A task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Priority A task",
				},
				{
					completed: false,
					priority: "B",
					description: "Priority B task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Priority B task",
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

			const originalLength = todos.length;
			const originalFirst = todos[0];

			// Filter by priority A
			const result = filterByPriority(todos, "A");

			// Verify original array is unchanged
			expect(todos).toHaveLength(originalLength);
			expect(todos[0]).toBe(originalFirst);
			expect(todos[1]?.priority).toBe("B");
			expect(todos[2]?.priority).toBeUndefined();

			// Verify result is a different array
			expect(result).not.toBe(todos);
		});

		it("should return a new array instance, not a reference to the original", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "Task 1",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Task 1",
				},
			];

			const result = filterByPriority(todos, "A");

			// Modify the result array
			result.push({
				completed: false,
				priority: "B",
				description: "Task 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(B) Task 2",
			});

			// Original array should still have only 1 element
			expect(todos).toHaveLength(1);
			expect(result).toHaveLength(2);
		});
	});

	describe("edge cases", () => {
		it("should return empty array when filtering empty array", () => {
			const todos: Todo[] = [];

			const result = filterByPriority(todos, "A");

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});

		it("should return empty array when no tasks match the priority", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "Priority A task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Priority A task",
				},
				{
					completed: false,
					priority: "B",
					description: "Priority B task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Priority B task",
				},
			];

			const result = filterByPriority(todos, "Z");

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});

		it("should correctly filter when multiple priorities are mixed", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "First A",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) First A",
				},
				{
					completed: false,
					priority: "B",
					description: "First B",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) First B",
				},
				{
					completed: false,
					priority: "A",
					description: "Second A",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Second A",
				},
				{
					completed: false,
					priority: "C",
					description: "First C",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(C) First C",
				},
				{
					completed: false,
					priority: "A",
					description: "Third A",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Third A",
				},
			];

			const result = filterByPriority(todos, "A");

			expect(result).toHaveLength(3);
			expect(result[0]?.description).toBe("First A");
			expect(result[1]?.description).toBe("Second A");
			expect(result[2]?.description).toBe("Third A");
			// Verify all results have priority A
			expect(result.every(todo => todo.priority === "A")).toBe(true);
		});

		it("should handle completed tasks correctly", () => {
			const todos: Todo[] = [
				{
					completed: true,
					priority: "A",
					completionDate: "2026-01-08",
					description: "Completed A task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "x 2026-01-08 (A) Completed A task",
				},
				{
					completed: false,
					priority: "A",
					description: "Incomplete A task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Incomplete A task",
				},
			];

			const result = filterByPriority(todos, "A");

			// Should return both completed and incomplete tasks with priority A
			expect(result).toHaveLength(2);
			expect(result[0]?.completed).toBe(true);
			expect(result[1]?.completed).toBe(false);
		});

		it("should preserve task order when filtering", () => {
			const todos: Todo[] = [
				{
					completed: false,
					priority: "A",
					description: "Third task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) Third task",
				},
				{
					completed: false,
					priority: "B",
					description: "Second task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(B) Second task",
				},
				{
					completed: false,
					priority: "A",
					description: "First task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "(A) First task",
				},
			];

			const result = filterByPriority(todos, "A");

			// Should preserve original order
			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Third task");
			expect(result[1]?.description).toBe("First task");
		});
	});
});
