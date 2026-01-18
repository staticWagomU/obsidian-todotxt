import { describe, it, expect, vi, beforeEach } from "vitest";

// Helper to extend HTMLElement with createEl method (Obsidian-like API)
function addCreateElHelper(element: HTMLElement): void {
	(element as any).createEl = (tag: string, options?: { cls?: string; text?: string }) => {
		const el = document.createElement(tag);
		if (options?.cls) {
			el.classList.add(options.cls);
		}
		if (options?.text) {
			el.textContent = options.text;
		}
		element.appendChild(el);
		addCreateElHelper(el);
		return el;
	};
	(element as any).empty = () => {
		element.innerHTML = "";
	};
}

describe("renderInlineTaskInput", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = document.createElement("div");
		addCreateElHelper(container);
	});

	describe("インライン入力欄UI表示", () => {
		it("インライン入力欄がコンテナ内に表示される", async () => {
			// Import the function (will fail until implemented)
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container as any, onAddTask);

			// Should create input element
			const inputContainer = container.querySelector(".inline-task-input-container");
			expect(inputContainer).not.toBeNull();

			const inputElement = container.querySelector("input.inline-task-input");
			expect(inputElement).not.toBeNull();
		});

		it("入力欄にプレースホルダーテキストが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container as any, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			expect(inputElement?.placeholder).toBe("タスクを追加...");
		});

		it("入力欄にaria-labelが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container as any, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			expect(inputElement?.getAttribute("aria-label")).toBe("インラインタスク入力");
		});
	});

	describe("Enterキーでのタスク追加", () => {
		it("入力欄でEnterキーを押すとonAddTaskコールバックが呼ばれる", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container as any, onAddTask);

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
			renderInlineTaskInput(container as any, onAddTask);

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
});
