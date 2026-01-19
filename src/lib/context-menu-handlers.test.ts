/**
 * context-menu-handlers - コンテキストメニューハンドラーテスト
 * TDD RED Phase: Subtask 2 - AC2対応
 */

import { describe, it, expect, vi } from "vitest";
import type { Todo } from "./todo";

// Mock Todo type
interface MockTodo {
	completed: boolean;
	description: string;
	priority?: string;
	projects: string[];
	contexts: string[];
	tags: Record<string, string>;
	raw: string;
	creationDate?: string;
	completionDate?: string;
}

describe("context-menu-handlers - 基本アクション", () => {
	describe("handleEdit - 編集アクション (AC2)", () => {
		it("handleEdit関数が存在する", async () => {
			const { handleEdit } = await import("./context-menu-handlers");
			expect(handleEdit).toBeDefined();
			expect(typeof handleEdit).toBe("function");
		});

		it("handleEditがonEditコールバックを呼び出す", async () => {
			const { handleEdit } = await import("./context-menu-handlers");
			const onEdit = vi.fn();
			
			handleEdit(0, onEdit);
			
			expect(onEdit).toHaveBeenCalledTimes(1);
			expect(onEdit).toHaveBeenCalledWith(0);
		});

		it("handleEditが正しいインデックスでonEditを呼び出す", async () => {
			const { handleEdit } = await import("./context-menu-handlers");
			const onEdit = vi.fn();
			
			handleEdit(5, onEdit);
			
			expect(onEdit).toHaveBeenCalledWith(5);
		});
	});

	describe("handleDelete - 削除アクション (AC2)", () => {
		it("handleDelete関数が存在する", async () => {
			const { handleDelete } = await import("./context-menu-handlers");
			expect(handleDelete).toBeDefined();
			expect(typeof handleDelete).toBe("function");
		});

		it("handleDeleteがonDeleteコールバックを呼び出す", async () => {
			const { handleDelete } = await import("./context-menu-handlers");
			const onDelete = vi.fn().mockResolvedValue(undefined);
			
			await handleDelete(0, onDelete);
			
			expect(onDelete).toHaveBeenCalledTimes(1);
			expect(onDelete).toHaveBeenCalledWith(0);
		});

		it("handleDeleteが正しいインデックスでonDeleteを呼び出す", async () => {
			const { handleDelete } = await import("./context-menu-handlers");
			const onDelete = vi.fn().mockResolvedValue(undefined);
			
			await handleDelete(3, onDelete);
			
			expect(onDelete).toHaveBeenCalledWith(3);
		});
	});

	describe("handleDuplicate - 複製アクション (AC2)", () => {
		it("handleDuplicate関数が存在する", async () => {
			const { handleDuplicate } = await import("./context-menu-handlers");
			expect(handleDuplicate).toBeDefined();
			expect(typeof handleDuplicate).toBe("function");
		});

		it("handleDuplicateがコンテンツに新しいタスクを追加する", async () => {
			const { handleDuplicate } = await import("./context-menu-handlers");
			
			const content = "(A) 2026-01-19 Test task +project @context";
			const result = handleDuplicate(content, 0);
			
			// Should have 2 lines now
			const lines = result.split("\n");
			expect(lines.length).toBe(2);
		});

		it("handleDuplicateが元のタスクと同じ内容のタスクを追加する", async () => {
			const { handleDuplicate } = await import("./context-menu-handlers");
			
			const content = "(A) 2026-01-19 Test task +project @context";
			const result = handleDuplicate(content, 0);
			
			const lines = result.split("\n");
			// Second line should be the duplicated task (new task is appended)
			expect(lines[1]).toContain("Test task");
			expect(lines[1]).toContain("+project");
			expect(lines[1]).toContain("@context");
		});

		it("handleDuplicateで複製されたタスクは未完了状態になる", async () => {
			const { handleDuplicate } = await import("./context-menu-handlers");
			
			const content = "x 2026-01-19 2026-01-18 Completed task";
			const result = handleDuplicate(content, 0);
			
			const lines = result.split("\n");
			// Duplicated task should not start with 'x'
			expect(lines[1]?.startsWith("x ")).toBe(false);
		});

		it("handleDuplicateで複製されたタスクは今日の作成日を持つ", async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-20"));
			
			const { handleDuplicate } = await import("./context-menu-handlers");
			
			const content = "(A) 2026-01-19 Test task";
			const result = handleDuplicate(content, 0);
			
			const lines = result.split("\n");
			expect(lines[1]).toContain("2026-01-20");
			
			vi.useRealTimers();
		});
	});
});

describe("handlePriorityChange - 優先度変更 (AC3)", () => {
	describe("handlePriorityChange関数", () => {
		it("handlePriorityChange関数が存在する", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");
			expect(handlePriorityChange).toBeDefined();
			expect(typeof handlePriorityChange).toBe("function");
		});

		it("handlePriorityChangeで優先度Aを設定できる", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handlePriorityChange(content, 0, "A");

			expect(result).toContain("(A)");
		});

		it("handlePriorityChangeで優先度Bを設定できる", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handlePriorityChange(content, 0, "B");

			expect(result).toContain("(B)");
		});

		it("handlePriorityChangeで優先度Zを設定できる", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handlePriorityChange(content, 0, "Z");

			expect(result).toContain("(Z)");
		});

		it("handlePriorityChangeで優先度を削除できる", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "(A) 2026-01-19 Test task";
			const result = handlePriorityChange(content, 0, undefined);

			expect(result).not.toContain("(A)");
			expect(result).not.toContain("(B)");
		});

		it("handlePriorityChangeで既存の優先度を別の優先度に変更できる", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "(A) 2026-01-19 Test task";
			const result = handlePriorityChange(content, 0, "C");

			expect(result).not.toContain("(A)");
			expect(result).toContain("(C)");
		});

		it("handlePriorityChangeが無効なインデックスの場合は元のコンテンツを返す", async () => {
			const { handlePriorityChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handlePriorityChange(content, 10, "A");

			expect(result).toBe(content);
		});
	});
});

describe("handleProjectChange - プロジェクト変更 (AC4)", () => {
	describe("handleProjectChange関数", () => {
		it("handleProjectChange関数が存在する", async () => {
			const { handleProjectChange } = await import("./context-menu-handlers");
			expect(handleProjectChange).toBeDefined();
			expect(typeof handleProjectChange).toBe("function");
		});

		it("handleProjectChangeでプロジェクトを追加できる", async () => {
			const { handleProjectChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handleProjectChange(content, 0, "work", "add");

			expect(result).toContain("+work");
		});

		it("handleProjectChangeでプロジェクトを削除できる", async () => {
			const { handleProjectChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task +work";
			const result = handleProjectChange(content, 0, "work", "remove");

			expect(result).not.toContain("+work");
		});

		it("handleProjectChangeで複数のプロジェクトから1つを削除できる", async () => {
			const { handleProjectChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task +work +personal";
			const result = handleProjectChange(content, 0, "work", "remove");

			expect(result).not.toContain("+work");
			expect(result).toContain("+personal");
		});

		it("handleProjectChangeが無効なインデックスの場合は元のコンテンツを返す", async () => {
			const { handleProjectChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handleProjectChange(content, 10, "work", "add");

			expect(result).toBe(content);
		});
	});
});

describe("handleContextChange - コンテキスト変更 (AC4)", () => {
	describe("handleContextChange関数", () => {
		it("handleContextChange関数が存在する", async () => {
			const { handleContextChange } = await import("./context-menu-handlers");
			expect(handleContextChange).toBeDefined();
			expect(typeof handleContextChange).toBe("function");
		});

		it("handleContextChangeでコンテキストを追加できる", async () => {
			const { handleContextChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handleContextChange(content, 0, "home", "add");

			expect(result).toContain("@home");
		});

		it("handleContextChangeでコンテキストを削除できる", async () => {
			const { handleContextChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task @home";
			const result = handleContextChange(content, 0, "home", "remove");

			expect(result).not.toContain("@home");
		});

		it("handleContextChangeで複数のコンテキストから1つを削除できる", async () => {
			const { handleContextChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task @home @office";
			const result = handleContextChange(content, 0, "home", "remove");

			expect(result).not.toContain("@home");
			expect(result).toContain("@office");
		});

		it("handleContextChangeが無効なインデックスの場合は元のコンテンツを返す", async () => {
			const { handleContextChange } = await import("./context-menu-handlers");

			const content = "2026-01-19 Test task";
			const result = handleContextChange(content, 10, "home", "add");

			expect(result).toBe(content);
		});
	});
});

describe("duplicateTask - タスク複製関数", () => {
	describe("duplicateTask関数", () => {
		it("duplicateTask関数が存在する", async () => {
			const { duplicateTask } = await import("./todo");
			expect(duplicateTask).toBeDefined();
			expect(typeof duplicateTask).toBe("function");
		});

		it("duplicateTaskが元のTodoと同じ内容のTodoを返す", async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-20"));
			
			const { duplicateTask } = await import("./todo");
			
			const original: MockTodo = {
				completed: false,
				description: "Test task +project @context",
				priority: "A",
				projects: ["project"],
				contexts: ["context"],
				tags: { due: "2026-01-25" },
				raw: "(A) 2026-01-19 Test task +project @context due:2026-01-25",
				creationDate: "2026-01-19",
			};
			
			const duplicated = duplicateTask(original as unknown as Todo);
			
			expect(duplicated.description).toBe(original.description);
			expect(duplicated.priority).toBe(original.priority);
			expect(duplicated.projects).toEqual(original.projects);
			expect(duplicated.contexts).toEqual(original.contexts);
			
			vi.useRealTimers();
		});

		it("duplicateTaskが未完了状態のTodoを返す", async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-20"));
			
			const { duplicateTask } = await import("./todo");
			
			const completed: MockTodo = {
				completed: true,
				description: "Completed task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x 2026-01-19 2026-01-18 Completed task",
				creationDate: "2026-01-18",
				completionDate: "2026-01-19",
			};
			
			const duplicated = duplicateTask(completed as unknown as Todo);
			
			expect(duplicated.completed).toBe(false);
			expect(duplicated.completionDate).toBeUndefined();
			
			vi.useRealTimers();
		});

		it("duplicateTaskが今日の日付を作成日として設定する", async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-20"));
			
			const { duplicateTask } = await import("./todo");
			
			const original: MockTodo = {
				completed: false,
				description: "Test task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "2026-01-19 Test task",
				creationDate: "2026-01-19",
			};
			
			const duplicated = duplicateTask(original as unknown as Todo);
			
			expect(duplicated.creationDate).toBe("2026-01-20");
			
			vi.useRealTimers();
		});
	});
});
