import { describe, it, expect, vi } from "vitest";
import { getAddHandler, getEditHandler, getArchiveHandler, getUndoHandler, getRedoHandler, getToggleHandler, type AutoArchiveDeps } from "./handlers";
import { UndoRedoHistory } from "./undo-redo";

describe("handlers", () => {
	describe("getAddHandler with date tags", () => {
		it("should add task with due: tag when dueDate is provided", async () => {
			let savedData = "";
			const getData = () => "";
			const setViewData = (data: string) => { savedData = data; };

			const addHandler = getAddHandler(getData, setViewData);
			await addHandler("New task", undefined, "2026-01-15", undefined);

			expect(savedData).toContain("New task");
			expect(savedData).toContain("due:2026-01-15");
		});

		it("should add task with t: tag when thresholdDate is provided", async () => {
			let savedData = "";
			const getData = () => "";
			const setViewData = (data: string) => { savedData = data; };

			const addHandler = getAddHandler(getData, setViewData);
			await addHandler("New task", undefined, undefined, "2026-01-20");

			expect(savedData).toContain("New task");
			expect(savedData).toContain("t:2026-01-20");
		});

		it("should add task with both due: and t: tags", async () => {
			let savedData = "";
			const getData = () => "";
			const setViewData = (data: string) => { savedData = data; };

			const addHandler = getAddHandler(getData, setViewData);
			await addHandler("New task", undefined, "2026-01-15", "2026-01-10");

			expect(savedData).toContain("New task");
			expect(savedData).toContain("due:2026-01-15");
			expect(savedData).toContain("t:2026-01-10");
		});
	});

	describe("getEditHandler with date tags", () => {
		it("should update due: tag on existing task", async () => {
			let savedData = "";
			const getData = () => "Buy milk";
			const setViewData = (data: string) => { savedData = data; };

			const editHandler = getEditHandler(getData, setViewData);
			await editHandler(0, { dueDate: "2026-02-01" });

			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("due:2026-02-01");
		});

		it("should update t: tag on existing task", async () => {
			let savedData = "";
			const getData = () => "Buy milk";
			const setViewData = (data: string) => { savedData = data; };

			const editHandler = getEditHandler(getData, setViewData);
			await editHandler(0, { thresholdDate: "2026-01-20" });

			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("t:2026-01-20");
		});
	});

	describe("getArchiveHandler", () => {
		it("should archive completed tasks to done.txt and remove from original", async () => {
			let savedTodoData = "";
			let savedArchiveData = "";
			const getData = () => "Task 1\nx 2025-01-14 Completed task\n(A) Task 2\n";
			const setViewData = (data: string) => { savedTodoData = data; };
			const readArchive = async () => "";
			const writeArchive = async (data: string) => { savedArchiveData = data; };

			const archiveHandler = getArchiveHandler(getData, setViewData, "vault/todo.txt", readArchive, writeArchive);
			await archiveHandler();

			expect(savedTodoData).not.toContain("x 2025-01-14 Completed task");
			expect(savedTodoData).toContain("Task 1");
			expect(savedTodoData).toContain("(A) Task 2");
			expect(savedArchiveData).toContain("x 2025-01-14 Completed task");
		});

		it("archive disabled: should not archive when no completed tasks exist", async () => {
			let savedTodoData = "";
			let savedArchiveData = "";
			const getData = () => "Task 1\n(A) Task 2\n";
			const setViewData = (data: string) => { savedTodoData = data; };
			const readArchive = async () => "";
			const writeArchive = async (data: string) => { savedArchiveData = data; };

			const archiveHandler = getArchiveHandler(getData, setViewData, "vault/todo.txt", readArchive, writeArchive);
			await archiveHandler();

			// Should not modify original content
			expect(savedTodoData).toBe("");
			expect(savedArchiveData).toBe("");
		});

		it("archive same directory: should create done.txt in same directory as todo.txt", async () => {
			const getData = () => "x 2025-01-14 Completed\n";
			const setViewData = () => {};
			const readArchive = async () => "";
			const writeArchive = async (_data: string) => {};

			const archiveHandler = getArchiveHandler(getData, setViewData, "vault/work/todo.txt", readArchive, writeArchive);
			// Handler should internally use getArchiveFilePath
			await archiveHandler();

			// This test verifies the integration with getArchiveFilePath
			// The actual path validation is in archive.test.ts
		});

		it("should append to existing archive file", async () => {
			let savedArchiveData = "";
			const getData = () => "x 2025-01-14 New completed\n";
			const setViewData = () => {};
			const readArchive = async () => "x 2025-01-10 Old completed\n";
			const writeArchive = async (data: string) => { savedArchiveData = data; };

			const archiveHandler = getArchiveHandler(getData, setViewData, "vault/todo.txt", readArchive, writeArchive);
			await archiveHandler();

			expect(savedArchiveData).toContain("x 2025-01-10 Old completed");
			expect(savedArchiveData).toContain("x 2025-01-14 New completed");
		});
	});

	describe("getToggleHandler with autoArchiveDeps", () => {
		it("should archive completed task when toggling incomplete → complete", async () => {
			let savedData = "";
			let archiveData = "";
			const getData = () => "Buy milk\nClean house";
			const setViewData = (data: string) => { savedData = data; };
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "",
				writeArchive: async (data: string) => { archiveData = data; },
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(0); // Toggle "Buy milk" to complete

			// Task should be removed from original file
			expect(savedData).not.toContain("Buy milk");
			expect(savedData).toContain("Clean house");
			// Task should appear in archive with completion mark
			expect(archiveData).toContain("x ");
			expect(archiveData).toContain("Buy milk");
		});

		it("should NOT archive when toggling complete → incomplete", async () => {
			let savedData = "";
			const writeArchive = vi.fn();
			const getData = () => "x 2025-01-15 Buy milk\nClean house";
			const setViewData = (data: string) => { savedData = data; };
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "",
				writeArchive,
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(0); // Toggle "x Buy milk" back to incomplete

			// writeArchive should not be called
			expect(writeArchive).not.toHaveBeenCalled();
			// Task should remain in original file (now incomplete)
			expect(savedData).toContain("Buy milk");
			expect(savedData).not.toMatch(/^x /m);
		});

		it("should work as before when autoArchiveDeps is not provided", async () => {
			let savedData = "";
			const getData = () => "Buy milk\nClean house";
			const setViewData = (data: string) => { savedData = data; };

			const handler = getToggleHandler(getData, setViewData);
			await handler(0); // Toggle "Buy milk" to complete

			// Task should remain in original file (just toggled)
			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("Clean house");
		});

		it("should only affect the toggled task, leaving others untouched", async () => {
			let savedData = "";
			let archiveData = "";
			const getData = () => "(A) Important task\nBuy milk\n(B) Another task";
			const setViewData = (data: string) => { savedData = data; };
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "",
				writeArchive: async (data: string) => { archiveData = data; },
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(1); // Toggle "Buy milk" (middle task)

			// Other tasks should remain
			expect(savedData).toContain("(A) Important task");
			expect(savedData).toContain("(B) Another task");
			// Toggled task should be in archive
			expect(archiveData).toContain("Buy milk");
		});

		it("should archive completed task and keep new recurring task in original file", async () => {
			let savedData = "";
			let archiveData = "";
			const getData = () => "Buy milk rec:1w\nClean house";
			const setViewData = (data: string) => { savedData = data; };
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "",
				writeArchive: async (data: string) => { archiveData = data; },
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(0); // Toggle recurring task "Buy milk rec:1w"

			// Completed task should be in archive
			expect(archiveData).toContain("x ");
			expect(archiveData).toContain("Buy milk");
			// New recurring task should remain in original file
			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("rec:1w");
			expect(savedData).toContain("Clean house");
		});

		it("should append to existing archive content", async () => {
			let archiveData = "";
			const getData = () => "Buy milk";
			const setViewData = () => {};
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "x 2025-01-10 Old task\n",
				writeArchive: async (data: string) => { archiveData = data; },
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(0);

			// Both old and new should be in archive
			expect(archiveData).toContain("x 2025-01-10 Old task");
			expect(archiveData).toContain("Buy milk");
		});

		it("should result in empty file when single task is archived", async () => {
			let savedData = "NOT_SET";
			let archiveData = "";
			const getData = () => "Buy milk";
			const setViewData = (data: string) => { savedData = data; };
			const autoArchiveDeps: AutoArchiveDeps = {
				readArchive: async () => "",
				writeArchive: async (data: string) => { archiveData = data; },
			};

			const handler = getToggleHandler(getData, setViewData, autoArchiveDeps);
			await handler(0);

			// Original file should be empty
			expect(savedData.trim()).toBe("");
			// Archive should have the task
			expect(archiveData).toContain("Buy milk");
		});
	});

	describe("getUndoHandler (AC1)", () => {
		it("should restore previous state when undo is possible", async () => {
			const history = new UndoRedoHistory<string>();
			let currentData = "initial state";
			const setViewData = (data: string) => { currentData = data; };

			// 履歴に状態を追加
			history.push("initial state");
			history.push("after edit");

			const undoHandler = getUndoHandler(history, setViewData);
			const result = await undoHandler();

			expect(result).toBe(true);
			expect(currentData).toBe("initial state");
		});

		it("should return false when undo is not possible", async () => {
			const history = new UndoRedoHistory<string>();
			let currentData = "initial state";
			const setViewData = (data: string) => { currentData = data; };

			const undoHandler = getUndoHandler(history, setViewData);
			const result = await undoHandler();

			expect(result).toBe(false);
			expect(currentData).toBe("initial state"); // unchanged
		});
	});

	describe("getRedoHandler (AC2)", () => {
		it("should restore next state when redo is possible", async () => {
			const history = new UndoRedoHistory<string>();
			let currentData = "initial state";
			const setViewData = (data: string) => { currentData = data; };

			// 履歴に状態を追加してundo
			history.push("initial state");
			history.push("after edit");
			history.undo();

			const redoHandler = getRedoHandler(history, setViewData);
			const result = await redoHandler();

			expect(result).toBe(true);
			expect(currentData).toBe("after edit");
		});

		it("should return false when redo is not possible", async () => {
			const history = new UndoRedoHistory<string>();
			let currentData = "after edit";
			const setViewData = (data: string) => { currentData = data; };

			// 履歴に状態を追加（undoしていない）
			history.push("initial state");
			history.push("after edit");

			const redoHandler = getRedoHandler(history, setViewData);
			const result = await redoHandler();

			expect(result).toBe(false);
			expect(currentData).toBe("after edit"); // unchanged
		});
	});
});
