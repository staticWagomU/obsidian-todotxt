/**
 * Daily Notes Integration Tests
 * Tests for detecting Daily Notes plugin and core functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isDailyNotesPluginEnabled, formatTasksForDailyNote } from "./daily-notes";
import type { Todo } from "./todo";

// Mock obsidian-daily-notes-interface
vi.mock("obsidian-daily-notes-interface", () => ({
	appHasDailyNotesPluginLoaded: vi.fn(),
}));

describe("Daily Notes Plugin Detection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("isDailyNotesPluginEnabled", () => {
		it("should return true when Daily Notes plugin is enabled", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(true);

			const mockApp = {} as never;
			const result = isDailyNotesPluginEnabled(mockApp);

			expect(result).toBe(true);
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledWith(mockApp);
		});

		it("should return false when Daily Notes plugin is not enabled", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(false);

			const mockApp = {} as never;
			const result = isDailyNotesPluginEnabled(mockApp);

			expect(result).toBe(false);
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledWith(mockApp);
		});

		it("should wrap the external library function", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(true);

			const mockApp = { vault: {} } as never;
			isDailyNotesPluginEnabled(mockApp);

			// Verify the wrapper function passes the app correctly
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledTimes(1);
		});
	});
});

describe("formatTasksForDailyNote", () => {
	const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
		completed: false,
		priority: undefined,
		creationDate: undefined,
		completionDate: undefined,
		description: "Test task",
		projects: [],
		contexts: [],
		tags: {},
		raw: "Test task",
		...overrides,
	});

	describe("basic formatting", () => {
		it("should format a single task with default prefix", () => {
			const todos = [createTodo({ description: "Buy groceries" })];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Buy groceries");
		});

		it("should format multiple tasks with newlines", () => {
			const todos = [
				createTodo({ description: "Task 1" }),
				createTodo({ description: "Task 2" }),
				createTodo({ description: "Task 3" }),
			];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3");
		});

		it("should handle empty task array", () => {
			const todos: Todo[] = [];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("");
		});
	});

	describe("custom prefix", () => {
		it("should use custom prefix '- '", () => {
			const todos = [createTodo({ description: "Simple task" })];
			const result = formatTasksForDailyNote(todos, "- ");

			expect(result).toBe("- Simple task");
		});

		it("should use custom prefix '* '", () => {
			const todos = [createTodo({ description: "Bullet task" })];
			const result = formatTasksForDailyNote(todos, "* ");

			expect(result).toBe("* Bullet task");
		});

		it("should handle empty prefix", () => {
			const todos = [createTodo({ description: "No prefix" })];
			const result = formatTasksForDailyNote(todos, "");

			expect(result).toBe("No prefix");
		});
	});

	describe("task with metadata", () => {
		it("should include priority in output", () => {
			const todos = [createTodo({ description: "Urgent task", priority: "A" })];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] (A) Urgent task");
		});

		it("should include projects in description as-is", () => {
			const todos = [createTodo({ description: "Work on project +work +coding" })];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Work on project +work +coding");
		});

		it("should include contexts in description as-is", () => {
			const todos = [createTodo({ description: "Call boss @phone @office" })];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Call boss @phone @office");
		});

		it("should include due date tag in output", () => {
			const todos = [createTodo({ description: "Task due:2024-01-20", tags: { due: "2024-01-20" } })];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Task due:2024-01-20");
		});
	});

	describe("completed tasks handling", () => {
		it("should skip completed tasks by default", () => {
			const todos = [
				createTodo({ description: "Active task", completed: false }),
				createTodo({ description: "Done task", completed: true }),
			];
			const result = formatTasksForDailyNote(todos, "- [ ] ");

			expect(result).toBe("- [ ] Active task");
		});
	});
});
