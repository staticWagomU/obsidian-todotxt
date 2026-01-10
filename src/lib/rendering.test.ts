/**
 * Rendering feature tests - Internal/External links and rec: tag display
 * Sprint 34: PBI-031 implementation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { parseTodoTxt } from "./parser";
import { extractInternalLinks } from "./internallink";
import { extractExternalLinks } from "./externallink";
import { parseRecurrenceTag } from "./recurrence";
import type { Todo } from "./todo";

/**
 * LinkHandler interface for abstracting Obsidian API
 * Allows testing without Obsidian app dependency
 */
export interface LinkHandler {
	openInternalLink(link: string): void;
}

/**
 * Render internal links as clickable elements
 */
export function renderInternalLinks(description: string): HTMLElement[] {
	const links = extractInternalLinks(description);
	return links.map(link => {
		const el = document.createElement("button");
		el.classList.add("internal-link");
		el.textContent = link.alias || link.link;
		el.dataset.link = link.link;
		return el;
	});
}

/**
 * Render external links as clickable anchor elements
 */
export function renderExternalLinks(description: string): HTMLElement[] {
	const links = extractExternalLinks(description);
	return links.map(link => {
		const el = document.createElement("a");
		el.classList.add("external-link");
		el.textContent = link.text;
		el.href = link.url;
		el.target = "_blank";
		el.rel = "noopener noreferrer";
		return el;
	});
}

/**
 * Render recurrence icon if rec: tag exists
 */
export function renderRecurrenceIcon(todo: Todo): HTMLElement | null {
	const recTag = todo.tags.rec;
	if (!recTag) {
		return null;
	}

	// Extract pattern string (remove "rec:" prefix)
	const pattern = recTag.replace(/^rec:/, "");

	const el = document.createElement("span");
	el.classList.add("recurrence-icon");
	el.textContent = "🔁"; // Recurrence icon
	el.setAttribute("aria-label", `繰り返し: ${pattern}`);
	el.setAttribute("title", `繰り返し: ${pattern}`);

	return el;
}

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
});
