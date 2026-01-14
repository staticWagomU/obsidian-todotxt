/**
 * Rendering feature tests - Internal/External links and rec: tag display
 * Sprint 34: PBI-031 implementation
 */

import { describe, it, expect, vi } from "vitest";
import { renderInternalLinks, renderExternalLinks, renderRecurrenceIcon, renderTaskList } from "./rendering";
import type { Todo } from "./todo";

describe("PBI-031: 内部/外部リンククリック可能表示", () => {
	describe("内部リンククリック可能表示", () => {
		it("[[Note]]形式の内部リンクがクリック可能な要素としてレンダリングされる", () => {
			const description = "Task with [[MyNote]]";
			const linkElements = renderInternalLinks(description);

			expect(linkElements).toHaveLength(1);
			expect(linkElements[0]?.textContent).toBe("MyNote");
			expect(linkElements[0]?.classList.contains("internal-link")).toBe(true);
		});

		it("[[Note|Alias]]形式のエイリアス付き内部リンクがエイリアスを表示する", () => {
			const description = "Task with [[MyNote|My Alias]]";
			const linkElements = renderInternalLinks(description);

			expect(linkElements).toHaveLength(1);
			expect(linkElements[0]?.textContent).toBe("My Alias");
			expect(linkElements[0]?.dataset.link).toBe("MyNote");
		});

		it("複数の内部リンクが全てクリック可能要素としてレンダリングされる", () => {
			const description = "Task with [[Note1]] and [[Note2]]";
			const linkElements = renderInternalLinks(description);

			expect(linkElements).toHaveLength(2);
			expect(linkElements[0]?.textContent).toBe("Note1");
			expect(linkElements[1]?.textContent).toBe("Note2");
		});

		it("内部リンク要素がbutton要素として生成される", () => {
			const description = "Task with [[MyNote]]";
			const linkElements = renderInternalLinks(description);

			expect(linkElements).toHaveLength(1);
			expect(linkElements[0]?.tagName).toBe("BUTTON");
			expect(linkElements[0]?.dataset.link).toBe("MyNote");
		});
	});

	describe("外部リンククリック可能表示", () => {
		it("[text](url)形式の外部リンクがクリック可能なアンカー要素としてレンダリングされる", () => {
			const description = "Task with [GitHub](https://github.com)";
			const linkElements = renderExternalLinks(description);

			expect(linkElements).toHaveLength(1);
			expect(linkElements[0]?.textContent).toBe("GitHub");
			expect(linkElements[0]?.tagName).toBe("A");
		});

		it("外部リンク要素がtarget=_blank属性を持つ", () => {
			const description = "Task with [GitHub](https://github.com)";
			const linkElements = renderExternalLinks(description);

			expect(linkElements).toHaveLength(1);
			const anchor = linkElements[0] as HTMLAnchorElement;
			expect(anchor.target).toBe("_blank");
			expect(anchor.href).toBe("https://github.com/");
		});

		it("外部リンク要素がrel=noopener noreferrer属性を持つ", () => {
			const description = "Task with [GitHub](https://github.com)";
			const linkElements = renderExternalLinks(description);

			expect(linkElements).toHaveLength(1);
			const anchor = linkElements[0] as HTMLAnchorElement;
			expect(anchor.rel).toBe("noopener noreferrer");
		});

		it("複数の外部リンクが全てアンカー要素としてレンダリングされる", () => {
			const description = "[Link1](https://example.com) and [Link2](https://test.com)";
			const linkElements = renderExternalLinks(description);

			expect(linkElements).toHaveLength(2);
			expect(linkElements[0]?.textContent).toBe("Link1");
			expect(linkElements[1]?.textContent).toBe("Link2");
		});
	});

	describe("rec:タグ視覚表示", () => {
		it("rec:タグが存在する場合に繰り返しアイコン要素が生成される", () => {
			const todo: Todo = {
				completed: false,
				description: "Recurring task",
				projects: [],
				contexts: [],
				tags: { rec: "rec:1d" },
				raw: "Recurring task rec:1d",
			};

			const iconElement = renderRecurrenceIcon(todo);

			expect(iconElement).toBeDefined();
			expect(iconElement?.classList.contains("recurrence-icon")).toBe(true);
		});

		it("rec:タグのパターン文字列がaria-labelに設定される", () => {
			const todo: Todo = {
				completed: false,
				description: "Recurring task",
				projects: [],
				contexts: [],
				tags: { rec: "rec:1w" },
				raw: "Recurring task rec:1w",
			};

			const iconElement = renderRecurrenceIcon(todo);

			expect(iconElement?.getAttribute("aria-label")).toBe("繰り返し: 1w");
		});

		it("rec:タグのパターン文字列がtitle属性（tooltip）に設定される", () => {
			const todo: Todo = {
				completed: false,
				description: "Recurring task",
				projects: [],
				contexts: [],
				tags: { rec: "rec:+1m" },
				raw: "Recurring task rec:+1m",
			};

			const iconElement = renderRecurrenceIcon(todo);

			expect(iconElement?.getAttribute("title")).toBe("繰り返し: +1m");
		});

		it("rec:タグが存在しない場合にnullを返す", () => {
			const todo: Todo = {
				completed: false,
				description: "Normal task",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Normal task",
			};

			const iconElement = renderRecurrenceIcon(todo);

			expect(iconElement).toBeNull();
		});
	});

	describe("アーカイブボタン表示", () => {
		it("renderTaskListにonArchiveコールバックが渡される", () => {
			const container = document.createElement("div");
			const onAddTask = () => {};
			const onToggle = async () => {};
			const onEdit = () => {};
			const onDelete = async () => {};
			const onArchive = async () => {};

			// This should not throw even if renderTaskList doesn't support onArchive yet
			expect(() => {
				// @ts-expect-error - Testing RED phase, onArchive parameter doesn't exist yet
				renderTaskList(container, "", onAddTask, onToggle, onEdit, onDelete, undefined, onArchive);
			}).not.toThrow();
		});

		it("完了タスクが存在する場合、アーカイブボタンが有効になる", () => {
			const container = document.createElement("div");
			const data = "Task 1\nx 2025-01-14 Completed task\n";
			const onAddTask = () => {};
			const onToggle = async () => {};
			const onEdit = () => {};
			const onDelete = async () => {};
			const onArchive = async () => {};

			// @ts-expect-error - Testing RED phase
			renderTaskList(container, data, onAddTask, onToggle, onEdit, onDelete, undefined, onArchive);

			const archiveButton = container.querySelector("button.archive-button") as HTMLButtonElement;
			expect(archiveButton).not.toBeNull();
			expect(archiveButton?.disabled).toBe(false);
		});

		it("完了タスクがない場合、アーカイブボタンが無効になる", () => {
			const container = document.createElement("div");
			const data = "Task 1\nTask 2\n";
			const onAddTask = () => {};
			const onToggle = async () => {};
			const onEdit = () => {};
			const onDelete = async () => {};
			const onArchive = async () => {};

			// @ts-expect-error - Testing RED phase
			renderTaskList(container, data, onAddTask, onToggle, onEdit, onDelete, undefined, onArchive);

			const archiveButton = container.querySelector("button.archive-button") as HTMLButtonElement;
			expect(archiveButton).not.toBeNull();
			expect(archiveButton?.disabled).toBe(true);
		});

		it("アーカイブボタンクリックでonArchiveコールバックが呼ばれる", () => {
			const container = document.createElement("div");
			const data = "x 2025-01-14 Completed task\n";
			const onAddTask = () => {};
			const onToggle = async () => {};
			const onEdit = () => {};
			const onDelete = async () => {};
			const onArchive = vi.fn();

			// @ts-expect-error - Testing RED phase
			renderTaskList(container, data, onAddTask, onToggle, onEdit, onDelete, undefined, onArchive);

			const archiveButton = container.querySelector("button.archive-button") as HTMLButtonElement;
			archiveButton?.click();

			expect(onArchive).toHaveBeenCalled();
		});
	});
});
