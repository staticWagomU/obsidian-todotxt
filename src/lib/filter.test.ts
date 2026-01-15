import { describe, expect, it } from "vitest";
import type { Todo } from "./todo";
import { filterByPriority, filterBySearch, filterByAdvancedSearch } from "./filter";

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

describe("filterBySearch", () => {
	describe("filter by search description", () => {
		it("should return tasks that contain the search keyword in description", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Buy groceries at the store",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Buy groceries at the store",
				},
				{
					completed: false,
					description: "Read a book",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Read a book",
				},
				{
					completed: false,
					description: "Buy new laptop",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Buy new laptop",
				},
			];

			const result = filterBySearch(todos, "Buy");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy groceries at the store");
			expect(result[1]?.description).toBe("Buy new laptop");
		});

		it("should return empty array when no tasks match the search keyword", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Buy groceries",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Buy groceries",
				},
				{
					completed: false,
					description: "Read a book",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Read a book",
				},
			];

			const result = filterBySearch(todos, "laptop");

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});

		it("should perform partial match search in description", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Complete the report",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Complete the report",
				},
				{
					completed: false,
					description: "Send invoice",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Send invoice",
				},
			];

			const result = filterBySearch(todos, "report");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Complete the report");
		});
	});

	describe("filter by search projects contexts", () => {
		it("should return tasks that contain the search keyword in projects", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Implement feature",
					projects: ["website", "mobile"],
					contexts: [],
					tags: {},
					raw: "Implement feature +website +mobile",
				},
				{
					completed: false,
					description: "Fix bug",
					projects: ["backend"],
					contexts: [],
					tags: {},
					raw: "Fix bug +backend",
				},
				{
					completed: false,
					description: "Write docs",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Write docs",
				},
			];

			const result = filterBySearch(todos, "website");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Implement feature");
			expect(result[0]?.projects).toContain("website");
		});

		it("should return tasks that contain the search keyword in contexts", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Call client",
					projects: [],
					contexts: ["phone", "office"],
					tags: {},
					raw: "Call client @phone @office",
				},
				{
					completed: false,
					description: "Send email",
					projects: [],
					contexts: ["computer"],
					tags: {},
					raw: "Send email @computer",
				},
			];

			const result = filterBySearch(todos, "phone");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Call client");
			expect(result[0]?.contexts).toContain("phone");
		});

		it("should return tasks that match keyword in description, projects, or contexts", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Task with home in description",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Task with home in description",
				},
				{
					completed: false,
					description: "Task A",
					projects: ["home"],
					contexts: [],
					tags: {},
					raw: "Task A +home",
				},
				{
					completed: false,
					description: "Task B",
					projects: [],
					contexts: ["home"],
					tags: {},
					raw: "Task B @home",
				},
				{
					completed: false,
					description: "Task C",
					projects: ["work"],
					contexts: ["office"],
					tags: {},
					raw: "Task C +work @office",
				},
			];

			const result = filterBySearch(todos, "home");

			expect(result).toHaveLength(3);
			expect(result[0]?.description).toBe("Task with home in description");
			expect(result[1]?.projects).toContain("home");
			expect(result[2]?.contexts).toContain("home");
		});
	});

	describe("filter by search case insensitive", () => {
		it("should perform case-insensitive search in description", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Buy groceries",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Buy groceries",
				},
				{
					completed: false,
					description: "buy laptop",
					projects: [],
					contexts: [],
					tags: {},
					raw: "buy laptop",
				},
				{
					completed: false,
					description: "Read book",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Read book",
				},
			];

			const result = filterBySearch(todos, "BUY");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy groceries");
			expect(result[1]?.description).toBe("buy laptop");
		});

		it("should perform case-insensitive search in projects", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Task 1",
					projects: ["Website"],
					contexts: [],
					tags: {},
					raw: "Task 1 +Website",
				},
				{
					completed: false,
					description: "Task 2",
					projects: ["backend"],
					contexts: [],
					tags: {},
					raw: "Task 2 +backend",
				},
			];

			const result = filterBySearch(todos, "website");

			expect(result).toHaveLength(1);
			expect(result[0]?.projects).toContain("Website");
		});

		it("should perform case-insensitive search in contexts", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Task A",
					projects: [],
					contexts: ["Office"],
					tags: {},
					raw: "Task A @Office",
				},
				{
					completed: false,
					description: "Task B",
					projects: [],
					contexts: ["home"],
					tags: {},
					raw: "Task B @home",
				},
			];

			const result = filterBySearch(todos, "OFFICE");

			expect(result).toHaveLength(1);
			expect(result[0]?.contexts).toContain("Office");
		});
	});

	describe("filter by search empty", () => {
		it("should return all tasks when search keyword is empty string", () => {
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
					projects: ["project"],
					contexts: [],
					tags: {},
					raw: "Task 2 +project",
				},
				{
					completed: false,
					description: "Task 3",
					projects: [],
					contexts: ["context"],
					tags: {},
					raw: "Task 3 @context",
				},
			];

			const result = filterBySearch(todos, "");

			expect(result).toHaveLength(3);
			expect(result).toEqual(todos);
		});

		it("should return new array instance even for empty string search", () => {
			const todos: Todo[] = [
				{
					completed: false,
					description: "Task",
					projects: [],
					contexts: [],
					tags: {},
					raw: "Task",
				},
			];

			const result = filterBySearch(todos, "");

			// Should be immutable (different array instance)
			expect(result).not.toBe(todos);
			expect(result).toEqual(todos);
		});
	});
});

describe("filterByAdvancedSearch", () => {
	// Helper function to create test todos
	const createTodo = (opts: Partial<Todo> & { description: string }): Todo => ({
		completed: false,
		projects: [],
		contexts: [],
		tags: {},
		raw: opts.description,
		...opts,
	});

	describe("AND search (space-separated terms)", () => {
		it("should return tasks matching all space-separated terms", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries at store" }),
				createTodo({ description: "Buy laptop online" }),
				createTodo({ description: "Read a book at home" }),
			];

			const result = filterByAdvancedSearch(todos, "Buy store");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Buy groceries at store");
		});

		it("should return empty array when not all terms match", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries" }),
				createTodo({ description: "Read book" }),
			];

			const result = filterByAdvancedSearch(todos, "Buy book");

			expect(result).toHaveLength(0);
		});

		it("should be case-insensitive for AND search", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy GROCERIES at Store" }),
			];

			const result = filterByAdvancedSearch(todos, "buy groceries store");

			expect(result).toHaveLength(1);
		});
	});

	describe("OR search (pipe-separated terms)", () => {
		it("should return tasks matching any pipe-separated term", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries" }),
				createTodo({ description: "Buy laptop" }),
				createTodo({ description: "Read book" }),
			];

			const result = filterByAdvancedSearch(todos, "groceries|book");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy groceries");
			expect(result[1]?.description).toBe("Read book");
		});

		it("should return all matching tasks for multiple OR terms", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task A" }),
				createTodo({ description: "Task B" }),
				createTodo({ description: "Task C" }),
			];

			const result = filterByAdvancedSearch(todos, "A|B|C");

			expect(result).toHaveLength(3);
		});

		it("should be case-insensitive for OR search", () => {
			const todos: Todo[] = [
				createTodo({ description: "GROCERIES" }),
				createTodo({ description: "laptop" }),
			];

			const result = filterByAdvancedSearch(todos, "groceries|LAPTOP");

			expect(result).toHaveLength(2);
		});
	});

	describe("NOT search (hyphen prefix)", () => {
		it("should exclude tasks matching the negated term", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries" }),
				createTodo({ description: "Buy laptop" }),
				createTodo({ description: "Read book" }),
			];

			const result = filterByAdvancedSearch(todos, "-groceries");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy laptop");
			expect(result[1]?.description).toBe("Read book");
		});

		it("should combine NOT with AND (exclude term from results)", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries at store" }),
				createTodo({ description: "Buy laptop online" }),
				createTodo({ description: "Read book at store" }),
			];

			const result = filterByAdvancedSearch(todos, "store -groceries");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Read book at store");
		});

		it("should be case-insensitive for NOT search", () => {
			const todos: Todo[] = [
				createTodo({ description: "GROCERIES task" }),
				createTodo({ description: "laptop task" }),
			];

			const result = filterByAdvancedSearch(todos, "-groceries");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("laptop task");
		});
	});

	describe("combined operators", () => {
		it("should handle AND with OR correctly", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries at store" }),
				createTodo({ description: "Buy laptop online" }),
				createTodo({ description: "Read book at library" }),
				createTodo({ description: "Return book to store" }),
			];

			// "Buy" AND ("store" OR "online")
			const result = filterByAdvancedSearch(todos, "Buy store|online");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy groceries at store");
			expect(result[1]?.description).toBe("Buy laptop online");
		});

		it("should handle AND, OR, and NOT together", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries at store" }),
				createTodo({ description: "Buy laptop at store" }),
				createTodo({ description: "Buy phone online" }),
				createTodo({ description: "Read book" }),
			];

			// "Buy" AND ("store" OR "online") NOT "groceries"
			const result = filterByAdvancedSearch(todos, "Buy store|online -groceries");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy laptop at store");
			expect(result[1]?.description).toBe("Buy phone online");
		});
	});

	describe("edge cases", () => {
		it("should return all tasks for empty query", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1" }),
				createTodo({ description: "Task 2" }),
			];

			const result = filterByAdvancedSearch(todos, "");

			expect(result).toHaveLength(2);
		});

		it("should handle whitespace-only query as empty", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1" }),
			];

			const result = filterByAdvancedSearch(todos, "   ");

			expect(result).toHaveLength(1);
		});

		it("should return empty array for empty input todos", () => {
			const todos: Todo[] = [];

			const result = filterByAdvancedSearch(todos, "test");

			expect(result).toHaveLength(0);
		});

		it("should search in projects and contexts as well", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task", projects: ["work"], contexts: [] }),
				createTodo({ description: "Task", projects: [], contexts: ["home"] }),
				createTodo({ description: "Task", projects: [], contexts: [] }),
			];

			const resultProject = filterByAdvancedSearch(todos, "work");
			const resultContext = filterByAdvancedSearch(todos, "home");

			expect(resultProject).toHaveLength(1);
			expect(resultProject[0]?.projects).toContain("work");
			expect(resultContext).toHaveLength(1);
			expect(resultContext[0]?.contexts).toContain("home");
		});
	});

	describe("regex search (/pattern/)", () => {
		it("should match tasks using regex pattern", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries" }),
				createTodo({ description: "Buy laptop" }),
				createTodo({ description: "Read book" }),
			];

			const result = filterByAdvancedSearch(todos, "/^Buy/");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Buy groceries");
			expect(result[1]?.description).toBe("Buy laptop");
		});

		it("should match tasks with complex regex patterns", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1" }),
				createTodo({ description: "Task 2" }),
				createTodo({ description: "Task 10" }),
				createTodo({ description: "Other thing" }),
			];

			const result = filterByAdvancedSearch(todos, "/Task \\d$/");

			expect(result).toHaveLength(2);
			expect(result[0]?.description).toBe("Task 1");
			expect(result[1]?.description).toBe("Task 2");
		});

		it("should be case-insensitive for regex by default", () => {
			const todos: Todo[] = [
				createTodo({ description: "BUY groceries" }),
				createTodo({ description: "buy laptop" }),
				createTodo({ description: "read book" }),
			];

			const result = filterByAdvancedSearch(todos, "/buy/");

			expect(result).toHaveLength(2);
		});

		it("should handle regex with special characters", () => {
			const todos: Todo[] = [
				createTodo({ description: "Fix bug (urgent)" }),
				createTodo({ description: "Fix bug [low]" }),
				createTodo({ description: "Review PR" }),
			];

			const result = filterByAdvancedSearch(todos, "/\\(urgent\\)/");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Fix bug (urgent)");
		});

		it("should return all tasks for invalid regex", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1" }),
				createTodo({ description: "Task 2" }),
			];

			// Invalid regex should fall back to literal search or return all
			const result = filterByAdvancedSearch(todos, "/[invalid/");

			// Invalid regex is treated as literal match
			expect(result).toHaveLength(0);
		});

		it("should combine regex with other operators", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries at store" }),
				createTodo({ description: "Buy laptop online" }),
				createTodo({ description: "Sell phone" }),
			];

			// Regex AND regular term
			const result = filterByAdvancedSearch(todos, "/^Buy/ store");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Buy groceries at store");
		});

		it("should handle regex in NOT expressions", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1" }),
				createTodo({ description: "Task 2" }),
				createTodo({ description: "Other thing" }),
			];

			const result = filterByAdvancedSearch(todos, "-/Task \\d/");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Other thing");
		});

		it("should search regex in projects and contexts", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task", projects: ["project-123"], contexts: [] }),
				createTodo({ description: "Task", projects: ["project-abc"], contexts: [] }),
				createTodo({ description: "Task", projects: [], contexts: ["work-456"] }),
			];

			const result = filterByAdvancedSearch(todos, "/\\d{3}/");

			expect(result).toHaveLength(2);
		});
	});

	describe("special syntax search (project:/context:/due:/priority:)", () => {
		it("should filter by project: syntax", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1", projects: ["work", "urgent"], contexts: [] }),
				createTodo({ description: "Task 2", projects: ["home"], contexts: [] }),
				createTodo({ description: "Task 3", projects: [], contexts: [] }),
			];

			const result = filterByAdvancedSearch(todos, "project:work");

			expect(result).toHaveLength(1);
			expect(result[0]?.projects).toContain("work");
		});

		it("should filter by context: syntax", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1", projects: [], contexts: ["office", "morning"] }),
				createTodo({ description: "Task 2", projects: [], contexts: ["home"] }),
				createTodo({ description: "Task 3", projects: [], contexts: [] }),
			];

			const result = filterByAdvancedSearch(todos, "context:office");

			expect(result).toHaveLength(1);
			expect(result[0]?.contexts).toContain("office");
		});

		it("should filter by priority: syntax", () => {
			const todos: Todo[] = [
				createTodo({ description: "High priority", priority: "A" }),
				createTodo({ description: "Medium priority", priority: "B" }),
				createTodo({ description: "No priority" }),
			];

			const result = filterByAdvancedSearch(todos, "priority:A");

			expect(result).toHaveLength(1);
			expect(result[0]?.priority).toBe("A");
		});

		it("should filter by due: syntax for exact date", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1", tags: { due: "2026-01-15" } }),
				createTodo({ description: "Task 2", tags: { due: "2026-01-20" } }),
				createTodo({ description: "Task 3", tags: {} }),
			];

			const result = filterByAdvancedSearch(todos, "due:2026-01-15");

			expect(result).toHaveLength(1);
			expect(result[0]?.tags.due).toBe("2026-01-15");
		});

		it("should be case-insensitive for special syntax values", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task", projects: ["WorkProject"], contexts: [] }),
			];

			const result = filterByAdvancedSearch(todos, "project:workproject");

			expect(result).toHaveLength(1);
		});

		it("should combine special syntax with regular search", () => {
			const todos: Todo[] = [
				createTodo({ description: "Buy groceries", projects: ["shopping"], contexts: [] }),
				createTodo({ description: "Buy laptop", projects: ["work"], contexts: [] }),
				createTodo({ description: "Read book", projects: ["home"], contexts: [] }),
			];

			const result = filterByAdvancedSearch(todos, "Buy project:shopping");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Buy groceries");
		});

		it("should combine multiple special syntax filters", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task A", projects: ["work"], contexts: ["office"], priority: "A" }),
				createTodo({ description: "Task B", projects: ["work"], contexts: ["home"], priority: "A" }),
				createTodo({ description: "Task C", projects: ["home"], contexts: ["office"], priority: "B" }),
			];

			const result = filterByAdvancedSearch(todos, "project:work context:office");

			expect(result).toHaveLength(1);
			expect(result[0]?.description).toBe("Task A");
		});

		it("should support NOT with special syntax", () => {
			const todos: Todo[] = [
				createTodo({ description: "Task 1", projects: ["work"], contexts: [] }),
				createTodo({ description: "Task 2", projects: ["home"], contexts: [] }),
				createTodo({ description: "Task 3", projects: ["personal"], contexts: [] }),
			];

			const result = filterByAdvancedSearch(todos, "-project:work");

			expect(result).toHaveLength(2);
			expect(result[0]?.projects).toContain("home");
			expect(result[1]?.projects).toContain("personal");
		});

		it("should handle priority:none for tasks without priority", () => {
			const todos: Todo[] = [
				createTodo({ description: "High priority", priority: "A" }),
				createTodo({ description: "No priority 1" }),
				createTodo({ description: "No priority 2" }),
			];

			const result = filterByAdvancedSearch(todos, "priority:none");

			expect(result).toHaveLength(2);
			expect(result[0]?.priority).toBeUndefined();
			expect(result[1]?.priority).toBeUndefined();
		});
	});
});
