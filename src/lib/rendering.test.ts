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

describe("renderInlineEditInput - インライン編集用入力UI", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = addCreateElHelper(document.createElement("div"));
	});

	describe("編集モード時のinput要素レンダリング", () => {
		it("編集モード時にinput要素がレンダリングされる", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Task to edit", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			expect(input).not.toBeNull();
			expect(input.value).toBe("Task to edit");
		});

		it("入力欄にインライン編集用のスタイルクラスが設定される", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Task", onSave, onCancel);

			const container_el = container.querySelector(".inline-edit-container");
			expect(container_el).not.toBeNull();
		});

		it("input要素にaria-labelが設定される", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Task", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			expect(input?.getAttribute("aria-label")).toBe("タスクを編集");
		});
	});

	describe("Enterキーで保存", () => {
		it("EnterキーでonSaveコールバックが呼ばれる", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Original", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			input.value = "Updated";

			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			input.dispatchEvent(enterEvent);

			expect(onSave).toHaveBeenCalledWith("Updated");
		});

		it("Cmd+Enterでもonlyへコールバックが呼ばれる", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Original", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			input.value = "Updated with Cmd";

			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				metaKey: true,
				bubbles: true,
			});
			input.dispatchEvent(enterEvent);

			expect(onSave).toHaveBeenCalledWith("Updated with Cmd");
		});
	});

	describe("Escキーでキャンセル", () => {
		it("Escキーでonへコールバックが呼ばれる", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Original", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			input.value = "Modified";

			const escEvent = new KeyboardEvent("keydown", {
				key: "Escape",
				bubbles: true,
			});
			input.dispatchEvent(escEvent);

			expect(onCancel).toHaveBeenCalled();
			expect(onSave).not.toHaveBeenCalled();
		});
	});

	describe("blur時の自動保存", () => {
		it("blur時にonSaveコールバックが呼ばれる", async () => {
			const { renderInlineEditInput } = await import("./rendering");

			const onSave = vi.fn();
			const onCancel = vi.fn();
			renderInlineEditInput(container, "Original", onSave, onCancel);

			const input = container.querySelector("input.inline-edit-input") as HTMLInputElement;
			input.value = "Auto-saved";

			const blurEvent = new FocusEvent("blur", { bubbles: true });
			input.dispatchEvent(blurEvent);

			expect(onSave).toHaveBeenCalledWith("Auto-saved");
		});
	});
});

describe("renderTaskItem - ダブルクリック・Enterキーで編集モード開始 (AC1, AC2)", () => {
	let ul: HTMLUListElement;

	beforeEach(() => {
		const div = addCreateElHelper(document.createElement("div"));
		ul = div.createEl("ul");
	});

	describe("ダブルクリックで編集モード開始 (AC1)", () => {
		it("タスク説明部分をダブルクリックするとonInlineEditコールバックが呼ばれる", async () => {
			const { renderTaskItemWithInlineEdit } = await import("./rendering");

			const todo = {
				completed: false,
				description: "Test task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Test task",
			};
			const onToggle = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();
			const onInlineEdit = vi.fn();

			renderTaskItemWithInlineEdit(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onInlineEdit);

			const descSpan = ul.querySelector(".task-description");
			expect(descSpan).not.toBeNull();

			const dblclickEvent = new MouseEvent("dblclick", { bubbles: true });
			descSpan!.dispatchEvent(dblclickEvent);

			expect(onInlineEdit).toHaveBeenCalledWith(0, "Test task");
		});
	});

	describe("Enterキーで編集モード開始 (AC2)", () => {
		it("フォーカス中のタスクでEnterキーを押すとonInlineEditコールバックが呼ばれる", async () => {
			const { renderTaskItemWithInlineEdit } = await import("./rendering");

			const todo = {
				completed: false,
				description: "Test task for Enter",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Test task for Enter",
			};
			const onToggle = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();
			const onInlineEdit = vi.fn();

			renderTaskItemWithInlineEdit(ul, todo, 1, new Date(), onToggle, onEdit, onDelete, onInlineEdit);

			const li = ul.querySelector("li");
			expect(li).not.toBeNull();

			// Ensure li is focusable
			li!.setAttribute("tabindex", "0");

			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			li!.dispatchEvent(enterEvent);

			expect(onInlineEdit).toHaveBeenCalledWith(1, "Test task for Enter");
		});

		it("他のキーを押してもonInlineEditコールバックが呼ばれない", async () => {
			const { renderTaskItemWithInlineEdit } = await import("./rendering");

			const todo = {
				completed: false,
				description: "Test task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Test task",
			};
			const onToggle = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();
			const onInlineEdit = vi.fn();

			renderTaskItemWithInlineEdit(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onInlineEdit);

			const li = ul.querySelector("li");

			const spaceEvent = new KeyboardEvent("keydown", {
				key: " ",
				bubbles: true,
			});
			li!.dispatchEvent(spaceEvent);

			expect(onInlineEdit).not.toHaveBeenCalled();
		});
	});
});
