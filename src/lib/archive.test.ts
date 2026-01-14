import { describe, it, expect } from "vitest";
import { archiveCompletedTasks, getArchiveFilePath, appendToArchiveFile } from "./archive";

describe("getArchiveFilePath", () => {
	it("should return done.txt path in same directory as todo.txt", () => {
		const todoPath = "vault/todo.txt";
		const archivePath = getArchiveFilePath(todoPath);
		expect(archivePath).toBe("vault/done.txt");
	});

	it("should handle nested directory paths", () => {
		const todoPath = "vault/work/tasks/todo.txt";
		const archivePath = getArchiveFilePath(todoPath);
		expect(archivePath).toBe("vault/work/tasks/done.txt");
	});

	it("should handle .todotxt extension", () => {
		const todoPath = "vault/tasks.todotxt";
		const archivePath = getArchiveFilePath(todoPath);
		expect(archivePath).toBe("vault/done.txt");
	});
});

describe("appendToArchiveFile", () => {
	it("should append completed tasks to archive content", () => {
		const existingArchive = "x 2025-01-10 Old completed task\n";
		const completedTasks = [
			{ raw: "x 2025-01-14 Completed task 1", completed: true, description: "Completed task 1", projects: [], contexts: [], tags: {} },
			{ raw: "x 2025-01-14 Completed task 2", completed: true, description: "Completed task 2", projects: [], contexts: [], tags: {} },
		];
		const result = appendToArchiveFile(existingArchive, completedTasks);
		expect(result).toBe("x 2025-01-10 Old completed task\nx 2025-01-14 Completed task 1\nx 2025-01-14 Completed task 2\n");
	});

	it("should handle empty archive file", () => {
		const existingArchive = "";
		const completedTasks = [
			{ raw: "x 2025-01-14 Completed task", completed: true, description: "Completed task", projects: [], contexts: [], tags: {} },
		];
		const result = appendToArchiveFile(existingArchive, completedTasks);
		expect(result).toBe("x 2025-01-14 Completed task\n");
	});

	it("archive append: should preserve existing archive content", () => {
		const existingArchive = "x 2025-01-10 Old task 1\nx 2025-01-11 Old task 2\n";
		const completedTasks = [
			{ raw: "x 2025-01-14 New task", completed: true, description: "New task", projects: [], contexts: [], tags: {} },
		];
		const result = appendToArchiveFile(existingArchive, completedTasks);
		expect(result).toContain("x 2025-01-10 Old task 1");
		expect(result).toContain("x 2025-01-11 Old task 2");
		expect(result).toContain("x 2025-01-14 New task");
	});
});

describe("archiveCompletedTasks", () => {
	it("should extract completed tasks and return remaining tasks", () => {
		const content = "Task 1\nx 2025-01-14 Completed task\n(A) Task 2\n";
		const { completedTasks, remainingContent } = archiveCompletedTasks(content);
		
		expect(completedTasks).toHaveLength(1);
		expect(completedTasks[0]?.completed).toBe(true);
		expect(remainingContent).toBe("Task 1\n(A) Task 2\n");
	});

	it("archive removes completed: should remove all completed tasks from original", () => {
		const content = "Task 1\nx 2025-01-14 Completed 1\nTask 2\nx 2025-01-13 Completed 2\n";
		const { remainingContent } = archiveCompletedTasks(content);
		
		expect(remainingContent).not.toContain("x 2025-01-14 Completed 1");
		expect(remainingContent).not.toContain("x 2025-01-13 Completed 2");
		expect(remainingContent).toContain("Task 1");
		expect(remainingContent).toContain("Task 2");
	});

	it("should return empty completed tasks when no tasks are completed", () => {
		const content = "Task 1\n(A) Task 2\n";
		const { completedTasks, remainingContent } = archiveCompletedTasks(content);
		
		expect(completedTasks).toHaveLength(0);
		expect(remainingContent).toBe(content);
	});

	it("should handle empty content", () => {
		const content = "";
		const { completedTasks, remainingContent } = archiveCompletedTasks(content);
		
		expect(completedTasks).toHaveLength(0);
		expect(remainingContent).toBe("");
	});
});
