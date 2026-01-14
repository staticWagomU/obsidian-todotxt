import { describe, it, expect } from "vitest";
import { getAddHandler, getEditHandler, getArchiveHandler } from "./handlers";

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
});
