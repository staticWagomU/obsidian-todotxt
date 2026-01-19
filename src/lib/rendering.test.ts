import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Helper to extend HTMLElement with createEl method (Obsidian-like API)
function addCreateElHelper(element: HTMLElement): HTMLElement {
	(element as unknown as Record<string, unknown>).createEl = (tag: string, options?: { cls?: string; text?: string }) => {
		const el = document.createElement(tag);
		if (options?.cls) {
			el.classList.add(options.cls);
		}
		if (options?.text) {
			el.textContent = options.text;
		}
		element.appendChild(el);
		return addCreateElHelper(el);
	};
	(element as unknown as Record<string, unknown>).empty = () => {
		element.innerHTML = "";
	};
	return element;
}

describe("renderInlineTaskInput", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = addCreateElHelper(document.createElement("div"));
	});

	describe("インライン入力欄UI表示", () => {
		it("インライン入力欄がコンテナ内に表示される", async () => {
			// Import the function (will fail until implemented)
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			// Should create input element
			const inputContainer = container.querySelector(".inline-task-input-container");
			expect(inputContainer).not.toBeNull();

			const inputElement = container.querySelector("input.inline-task-input");
			expect(inputElement).not.toBeNull();
		});

		it("入力欄にプレースホルダーテキストが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			expect(inputElement?.placeholder).toBe("タスクを追加...");
		});

		it("入力欄にaria-labelが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			expect(inputElement?.getAttribute("aria-label")).toBe("インラインタスク入力");
		});
	});

	describe("Enterキーでのタスク追加", () => {
		it("入力欄でEnterキーを押すとonAddTaskコールバックが呼ばれる", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task";

			// Dispatch Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).toHaveBeenCalledTimes(1);
			expect(onAddTask).toHaveBeenCalledWith("New task");
		});

		it("Enter以外のキーではonAddTaskコールバックが呼ばれない", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task";

			// Dispatch Tab keydown event
			const tabEvent = new KeyboardEvent("keydown", {
				key: "Tab",
				bubbles: true,
			});
			inputElement.dispatchEvent(tabEvent);

			expect(onAddTask).not.toHaveBeenCalled();
		});
	});

	describe("作成日自動設定", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-19"));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("getAddHandlerを使用した場合、作成日が今日の日付に設定される", async () => {
			const { getAddHandler } = await import("./handlers");

			let savedData = "";
			const getData = () => "";
			const setViewData = (data: string) => { savedData = data; };

			const addHandler = getAddHandler(getData, setViewData);
			await addHandler("New inline task");

			// Should contain today's date as creation date
			expect(savedData).toContain("2026-01-19");
			expect(savedData).toContain("New inline task");
		});
	});

	describe("入力欄クリア", () => {
		it("タスク追加後に入力欄がクリアされる", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task";

			// Dispatch Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			// Input should be cleared after adding task
			expect(inputElement.value).toBe("");
		});
	});

	describe("空文字バリデーション", () => {
		it("空文字入力でEnterを押した場合、onAddTaskが呼ばれない", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "";

			// Dispatch Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).not.toHaveBeenCalled();
		});

		it("空白のみの入力でEnterを押した場合、onAddTaskが呼ばれない", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "   ";

			// Dispatch Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).not.toHaveBeenCalled();
		});
	});
});
