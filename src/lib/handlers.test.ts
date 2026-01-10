import { describe, it, expect } from "vitest";
import { getAddHandler, getEditHandler } from "./handlers";

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
			await editHandler(0, { description: "Buy milk", dueDate: "2026-02-01", thresholdDate: undefined });

			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("due:2026-02-01");
		});

		it("should update t: tag on existing task", async () => {
			let savedData = "";
			const getData = () => "Buy milk";
			const setViewData = (data: string) => { savedData = data; };

			const editHandler = getEditHandler(getData, setViewData);
			await editHandler(0, { description: "Buy milk", thresholdDate: "2026-01-20", dueDate: undefined });

			expect(savedData).toContain("Buy milk");
			expect(savedData).toContain("t:2026-01-20");
		});
	});
});
