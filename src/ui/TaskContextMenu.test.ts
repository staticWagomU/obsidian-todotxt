/**
 * TaskContextMenu - コンテキストメニュー基盤テスト
 * TDD RED Phase: Subtask 1 - AC1対応
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Todo } from "../lib/todo";

// Mock Obsidian Module
vi.mock("obsidian", () => {
	class MockMenuItem {
		private title = "";
		private icon = "";
		private callback: (() => void) | null = null;
		private submenuRef: MockMenu | null = null;

		setTitle(title: string): MockMenuItem {
			this.title = title;
			return this;
		}

		setIcon(icon: string): MockMenuItem {
			this.icon = icon;
			return this;
		}

		onClick(callback: () => void): MockMenuItem {
			this.callback = callback;
			return this;
		}

		setSection(_name: string): MockMenuItem {
			return this;
		}

		setSubmenu(): MockMenu {
			this.submenuRef = new MockMenu();
			return this.submenuRef;
		}

		getTitle(): string { return this.title; }
		getCallback(): (() => void) | null { return this.callback; }
	}

	class MockMenu {
		private items: MockMenuItem[] = [];

		addItem(cb: (item: MockMenuItem) => void): MockMenu {
			const item = new MockMenuItem();
			cb(item);
			this.items.push(item);
			return this;
		}

		addSeparator(): MockMenu {
			return this;
		}

		showAtPosition(_position: { x: number; y: number }): void {
			// Mock show
		}

		showAtMouseEvent(_event: MouseEvent): void {
			// Mock show
		}

		close(): void {
			// Mock close
		}

		getItems(): MockMenuItem[] { return this.items; }
	}

	return {
		Menu: MockMenu,
	};
});

// Mock Todo type
interface MockTodo {
	completed: boolean;
	description: string;
	priority?: string;
	projects: string[];
	contexts: string[];
	tags: Record<string, string>;
	raw: string;
}

describe("TaskContextMenu - コンテキストメニュー基盤", () => {
	let mockTodo: MockTodo;

	beforeEach(() => {
		mockTodo = {
			completed: false,
			description: "Test task +project @context",
			priority: "A",
			projects: ["project"],
			contexts: ["context"],
			tags: {},
			raw: "(A) Test task +project @context",
		};
	});

	describe("コンテキストメニュー表示 (AC1)", () => {
		it("TaskContextMenuクラスが存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			expect(TaskContextMenu).toBeDefined();
		});

		it("コンストラクタでTodoとコールバックを受け取る", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			expect(menu).toBeDefined();
		});

		it("showAtPositionメソッドで指定位置にメニューを表示できる", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			expect(typeof menu.showAtPosition).toBe("function");
		});

		it("showAtMouseEventメソッドでマウスイベント位置にメニューを表示できる", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			expect(typeof menu.showAtMouseEvent).toBe("function");
		});
	});

	describe("メニュー項目存在確認", () => {
		it("編集メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "編集")).toBe(true);
		});

		it("削除メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "削除")).toBe(true);
		});

		it("複製メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "複製")).toBe(true);
		});

		it("優先度変更メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "優先度変更")).toBe(true);
		});

		it("プロジェクト変更メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "プロジェクト")).toBe(true);
		});

		it("コンテキスト変更メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "コンテキスト")).toBe(true);
		});
	});

	describe("閉じる動作テスト", () => {
		it("closeメソッドが存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			expect(typeof menu.close).toBe("function");
		});
	});

	describe("ページを作成/開くメニュー項目 (Issue #12)", () => {
		it("リンクなしタスクで「ページを作成」メニュー項目が表示される", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onCreatePage: vi.fn(),
				onOpenPage: vi.fn(),
			};

			// リンクなしタスク
			const noLinkTodo = {
				...mockTodo,
				description: "Test task without link",
			};

			const menu = new TaskContextMenu(noLinkTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "ページを作成")).toBe(true);
			expect(items.some(item => item.title === "ページを開く")).toBe(false);
		});

		it("「ページを作成」メニュー項目にfile-plusアイコンが設定されている", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onCreatePage: vi.fn(),
				onOpenPage: vi.fn(),
			};

			const noLinkTodo = {
				...mockTodo,
				description: "Test task without link",
			};

			const menu = new TaskContextMenu(noLinkTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			const createItem = items.find(item => item.title === "ページを作成");
			expect(createItem?.icon).toBe("file-plus");
		});

		it("リンクありタスクで「ページを開く」メニュー項目が表示される", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onCreatePage: vi.fn(),
				onOpenPage: vi.fn(),
			};

			// 内部リンクありタスク
			const linkTodo = {
				...mockTodo,
				description: "Test task [[some page]]",
			};

			const menu = new TaskContextMenu(linkTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "ページを開く")).toBe(true);
			expect(items.some(item => item.title === "ページを作成")).toBe(false);
		});

		it("「ページを開く」メニュー項目にfile-textアイコンが設定されている", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onCreatePage: vi.fn(),
				onOpenPage: vi.fn(),
			};

			const linkTodo = {
				...mockTodo,
				description: "Test task [[some page]]",
			};

			const menu = new TaskContextMenu(linkTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			const openItem = items.find(item => item.title === "ページを開く");
			expect(openItem?.icon).toBe("file-text");
		});

		it("onCreatePage/onOpenPageコールバックが未指定の場合はメニュー項目が表示されない", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "ページを作成")).toBe(false);
			expect(items.some(item => item.title === "ページを開く")).toBe(false);
		});
	});

	describe("AIで分解メニュー項目 (PBI-067 AC1)", () => {
		it("「AIで分解」メニュー項目が存在する", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onDecompose: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "AIで分解")).toBe(true);
		});

		it("「AIで分解」メニュー項目にsplit-squareアイコンが設定されている", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
				onDecompose: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			const decomposeItem = items.find(item => item.title === "AIで分解");
			expect(decomposeItem?.icon).toBe("split-square");
		});

		it("onDecomposeコールバックが未指定の場合は「AIで分解」項目が表示されない", async () => {
			const { TaskContextMenu } = await import("./TaskContextMenu");
			const callbacks = {
				onEdit: vi.fn(),
				onDelete: vi.fn(),
				onDuplicate: vi.fn(),
				onPriorityChange: vi.fn(),
				onProjectChange: vi.fn(),
				onContextChange: vi.fn(),
			};

			const menu = new TaskContextMenu(mockTodo as unknown as Todo, 0, callbacks);
			const items = menu.getMenuItems();
			expect(items.some(item => item.title === "AIで分解")).toBe(false);
		});
	});
});
