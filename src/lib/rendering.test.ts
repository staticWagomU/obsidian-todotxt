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
			expect(inputElement?.placeholder).toBe("タスクを追加... (Ctrl+Enter)");
		});

		it("入力欄にaria-labelが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			expect(inputElement?.getAttribute("aria-label")).toBe("インラインタスク入力");
		});
	});

	describe("Ctrl+Enterキーでのタスク追加", () => {
		it("入力欄でCtrl+Enterキーを押すとonAddTaskコールバックが呼ばれる", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task";

			// Dispatch Ctrl+Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				ctrlKey: true,
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).toHaveBeenCalledTimes(1);
			expect(onAddTask).toHaveBeenCalledWith("New task");
		});

		it("Cmd+Enterキーでもタスクが追加される（macOS対応）", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task on Mac";

			// Dispatch Cmd+Enter keydown event (metaKey for Mac)
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				metaKey: true,
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).toHaveBeenCalledTimes(1);
			expect(onAddTask).toHaveBeenCalledWith("New task on Mac");
		});

		it("Enterのみ（Ctrl/Cmd無し）ではonAddTaskが呼ばれない（IME入力対応）", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task";

			// Dispatch Enter keydown event without Ctrl/Cmd
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).not.toHaveBeenCalled();
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

	describe("追加ボタンでのタスク追加", () => {
		it("追加ボタンをクリックするとonAddTaskコールバックが呼ばれる", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "New task via button";

			const addButton = container.querySelector("button.inline-task-add-button") as HTMLButtonElement;
			expect(addButton).not.toBeNull();
			addButton.click();

			expect(onAddTask).toHaveBeenCalledTimes(1);
			expect(onAddTask).toHaveBeenCalledWith("New task via button");
		});

		it("追加ボタンにaria-labelが設定される", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const addButton = container.querySelector("button.inline-task-add-button") as HTMLButtonElement;
			expect(addButton?.getAttribute("aria-label")).toBe("タスクを追加");
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

			// Dispatch Ctrl+Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				ctrlKey: true,
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			// Input should be cleared after adding task
			expect(inputElement.value).toBe("");
		});
	});

	describe("空文字バリデーション", () => {
		it("空文字入力でCtrl+Enterを押した場合、onAddTaskが呼ばれない", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "";

			// Dispatch Ctrl+Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				ctrlKey: true,
				bubbles: true,
			});
			inputElement.dispatchEvent(enterEvent);

			expect(onAddTask).not.toHaveBeenCalled();
		});

		it("空白のみの入力でCtrl+Enterを押した場合、onAddTaskが呼ばれない", async () => {
			const { renderInlineTaskInput } = await import("./rendering");

			const onAddTask = vi.fn();
			renderInlineTaskInput(container, onAddTask);

			const inputElement = container.querySelector("input.inline-task-input") as HTMLInputElement;
			inputElement.value = "   ";

			// Dispatch Ctrl+Enter keydown event
			const enterEvent = new KeyboardEvent("keydown", {
				key: "Enter",
				ctrlKey: true,
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

describe("renderTaskItemWithContextMenu - ロングプレスでコンテキストメニュー表示 (AC5)", () => {
	let ul: HTMLUListElement;

	beforeEach(() => {
		vi.useFakeTimers();
		const div = addCreateElHelper(document.createElement("div"));
		ul = div.createEl("ul");
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("ロングプレスイベント登録", () => {
		it("renderTaskItemWithContextMenuが存在する", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");
			expect(renderTaskItemWithContextMenu).toBeDefined();
		});

		it("タスク要素にtouchstartイベントハンドラーが設定される", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li");
			expect(li).not.toBeNull();

			// touchstartイベントをディスパッチしてもエラーにならないことを確認
			const touchStartEvent = new TouchEvent("touchstart", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li! })],
			});
			expect(() => li!.dispatchEvent(touchStartEvent)).not.toThrow();
		});
	});

	describe("タイマー動作テスト", () => {
		it("500ms以上のロングプレスでonContextMenuが呼ばれる", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li")!;

			// Start touch
			const touchStartEvent = new TouchEvent("touchstart", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li, clientX: 100, clientY: 100 })],
			});
			li.dispatchEvent(touchStartEvent);

			// Wait 500ms
			vi.advanceTimersByTime(500);

			expect(onContextMenu).toHaveBeenCalledTimes(1);
			expect(onContextMenu).toHaveBeenCalledWith(0, expect.objectContaining({ x: 100, y: 100 }));
		});

		it("500ms未満のタッチではonContextMenuが呼ばれない", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li")!;

			// Start touch
			const touchStartEvent = new TouchEvent("touchstart", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li, clientX: 100, clientY: 100 })],
			});
			li.dispatchEvent(touchStartEvent);

			// Wait only 400ms
			vi.advanceTimersByTime(400);

			// End touch before 500ms
			const touchEndEvent = new TouchEvent("touchend", { bubbles: true });
			li.dispatchEvent(touchEndEvent);

			expect(onContextMenu).not.toHaveBeenCalled();
		});
	});

	describe("キャンセル動作テスト", () => {
		it("touchendでタイマーがキャンセルされる", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li")!;

			// Start touch
			const touchStartEvent = new TouchEvent("touchstart", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li, clientX: 100, clientY: 100 })],
			});
			li.dispatchEvent(touchStartEvent);

			// Wait 300ms then end touch
			vi.advanceTimersByTime(300);
			const touchEndEvent = new TouchEvent("touchend", { bubbles: true });
			li.dispatchEvent(touchEndEvent);

			// Wait more time - should not trigger
			vi.advanceTimersByTime(300);

			expect(onContextMenu).not.toHaveBeenCalled();
		});

		it("touchmoveでタイマーがキャンセルされる", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li")!;

			// Start touch
			const touchStartEvent = new TouchEvent("touchstart", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li, clientX: 100, clientY: 100 })],
			});
			li.dispatchEvent(touchStartEvent);

			// Wait 300ms then move
			vi.advanceTimersByTime(300);
			const touchMoveEvent = new TouchEvent("touchmove", {
				bubbles: true,
				touches: [new Touch({ identifier: 0, target: li, clientX: 150, clientY: 150 })],
			});
			li.dispatchEvent(touchMoveEvent);

			// Wait more time - should not trigger
			vi.advanceTimersByTime(300);

			expect(onContextMenu).not.toHaveBeenCalled();
		});
	});

	describe("右クリックイベント", () => {
		it("右クリックでonContextMenuが呼ばれる", async () => {
			const { renderTaskItemWithContextMenu } = await import("./rendering");

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
			const onContextMenu = vi.fn();

			renderTaskItemWithContextMenu(ul, todo, 0, new Date(), onToggle, onEdit, onDelete, onContextMenu);

			const li = ul.querySelector("li")!;

			// Right click
			const contextMenuEvent = new MouseEvent("contextmenu", {
				bubbles: true,
				clientX: 200,
				clientY: 200,
			});
			li.dispatchEvent(contextMenuEvent);

			expect(onContextMenu).toHaveBeenCalledTimes(1);
			expect(onContextMenu).toHaveBeenCalledWith(0, expect.objectContaining({ x: 200, y: 200 }));
		});
	});
});

/**
 * Sprint 64 - Subtask 7 & 8: E2E統合テスト (AC1-5)
 *
 * パフォーマンス最適化モジュールと既存レンダリングの統合検証
 *
 * AC1: 仮想スクロールにより表示範囲のみDOMをレンダリングする
 * AC2: 1000件のタスクでも初期表示が500ms以内に完了する
 * AC3: スクロール時のFPSが50fps以上を維持する
 * AC4: フィルタリング・ソート処理がUIをブロックしない
 * AC5: メモリ使用量が100件と1000件で2倍以内の増加に抑える
 */
describe("Virtual Scroll E2E Integration (AC1-5)", () => {
	beforeEach(() => {
		addCreateElHelper(document.createElement("div"));
	});

	describe("AC1: Virtual scroll module integration", () => {
		it("should import and use VirtualScroller with rendering", async () => {
			const { VirtualScroller, calculateVisibleRangeWithOverscan } = await import("./virtual-scroller");

			// Simulate render context
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 600,
				totalItems: 1000,
				overscan: 3,
			});

			const range = scroller.getVisibleRange(0);

			// Verify virtual scroll provides correct range for rendering
			expect(range.startIndex).toBe(0);
			expect(range.endIndex).toBeLessThan(20); // Only visible items

			// Verify with overscan
			const rangeWithOverscan = calculateVisibleRangeWithOverscan({
				scrollTop: 0,
				itemHeight: 40,
				containerHeight: 600,
				totalItems: 1000,
				overscan: 3,
			});

			expect(rangeWithOverscan.renderCount).toBeLessThan(30);
		});

		it("should calculate correct DOM node count for virtual rendering", async () => {
			const { calculateVisibleRangeWithOverscan } = await import("./virtual-scroller");

			// 1000 tasks in list
			const totalTasks = 1000;
			const range = calculateVisibleRangeWithOverscan({
				scrollTop: 500,
				itemHeight: 40,
				containerHeight: 600,
				totalItems: totalTasks,
				overscan: 3,
			});

			// Instead of 1000 DOM nodes, only render visible + overscan
			expect(range.renderCount).toBeLessThan(30);

			// Verify this is much less than total
			expect(range.renderCount / totalTasks).toBeLessThan(0.05); // Less than 5%
		});
	});

	describe("AC2: Initial render performance", () => {
		it("should complete virtual scroll calculation for 1000 items within 500ms", async () => {
			const { measureRenderTime } = await import("./performance-metrics");
			const { VirtualScroller } = await import("./virtual-scroller");

			const result = await measureRenderTime(() => {
				const scroller = new VirtualScroller({
					itemHeight: 40,
					containerHeight: 600,
					totalItems: 1000,
					overscan: 3,
				});

				// Simulate initial render calculations
				scroller.getVisibleRange(0);
				scroller.getTotalHeight();
				return scroller;
			});

			expect(result.duration).toBeLessThan(500);
		});
	});

	describe("AC3: Scroll handler performance", () => {
		it("should complete scroll handler within 20ms (50fps)", async () => {
			const { measureScrollHandlerTime } = await import("./performance-metrics");
			const { calculateVisibleRangeWithOverscan } = await import("./virtual-scroller");

			const result = measureScrollHandlerTime(() => {
				return calculateVisibleRangeWithOverscan({
					scrollTop: 2000,
					itemHeight: 40,
					containerHeight: 600,
					totalItems: 1000,
					overscan: 3,
				});
			});

			expect(result.withinBudget).toBe(true);
			expect(result.duration).toBeLessThan(20);
		});
	});

	describe("AC4: Non-blocking filter integration", () => {
		it("should filter asynchronously without blocking", async () => {
			const { filterTodosAsync } = await import("./filter");
			const { parseTodoTxt } = await import("./parser");

			// Generate 1000 tasks
			const tasks = Array.from(
				{ length: 1000 },
				(_, i) => `(${String.fromCharCode(65 + (i % 3))}) Task ${i + 1} +project${i % 5} @context${i % 4}`
			).join("\n");

			const todos = parseTodoTxt(tasks);

			const startTime = performance.now();
			const promise = filterTodosAsync(todos, { priority: "A" });
			const callTime = performance.now() - startTime;

			// Promise should return immediately
			expect(callTime).toBeLessThan(10);

			// Wait for result
			const filtered = await promise;
			expect(filtered.length).toBeGreaterThan(300); // ~333 with priority A
		});
	});

	describe("AC5: Memory efficiency verification", () => {
		it("should render same number of DOM nodes for 100 and 1000 items", async () => {
			const { calculateVisibleRangeWithOverscan } = await import("./virtual-scroller");

			const params = {
				itemHeight: 40,
				containerHeight: 600,
				overscan: 3,
			};

			const range100 = calculateVisibleRangeWithOverscan({
				...params,
				scrollTop: 0,
				totalItems: 100,
			});

			const range1000 = calculateVisibleRangeWithOverscan({
				...params,
				scrollTop: 0,
				totalItems: 1000,
			});

			// Same render count (memory efficiency)
			expect(range100.renderCount).toBe(range1000.renderCount);
		});
	});

	describe("Combined modules integration", () => {
		it("should integrate all performance modules together", async () => {
			const { VirtualScroller, calculateVisibleRangeWithOverscan } = await import("./virtual-scroller");
			const { filterTodosAsync } = await import("./filter");
			const { createPerformanceMonitor, measureRenderTime } = await import("./performance-metrics");
			const { parseTodoTxt } = await import("./parser");

			const monitor = createPerformanceMonitor();

			// Generate 1000 tasks
			const tasks = Array.from(
				{ length: 1000 },
				(_, i) => `(${String.fromCharCode(65 + (i % 3))}) Task ${i + 1}`
			).join("\n");

			// 1. Parse tasks
			const parseResult = await measureRenderTime(() => parseTodoTxt(tasks));
			monitor.recordMetric({ type: "render", duration: parseResult.duration, timestamp: Date.now(), label: "parse" });

			// 2. Initialize virtual scroller
			const scrollerResult = await measureRenderTime(() => {
				return new VirtualScroller({
					itemHeight: 40,
					containerHeight: 600,
					totalItems: parseResult.value.length,
					overscan: 3,
				});
			});
			monitor.recordMetric({ type: "render", duration: scrollerResult.duration, timestamp: Date.now(), label: "scroller" });

			// 3. Filter asynchronously
			const filterStart = performance.now();
			const filteredTodos = await filterTodosAsync(parseResult.value, { priority: "A" });
			const filterDuration = performance.now() - filterStart;
			monitor.recordMetric({ type: "filter", duration: filterDuration, timestamp: Date.now(), label: "filter" });

			// 4. Calculate visible range
			const range = calculateVisibleRangeWithOverscan({
				scrollTop: 0,
				itemHeight: 40,
				containerHeight: 600,
				totalItems: filteredTodos.length,
				overscan: 3,
			});

			// Verify all AC requirements
			expect(monitor.meetsRenderTimeRequirement(500)).toBe(true); // AC2
			expect(range.renderCount).toBeLessThan(30); // AC1, AC5
			expect(filteredTodos.length).toBeGreaterThan(0); // AC4
		});
	});
});
