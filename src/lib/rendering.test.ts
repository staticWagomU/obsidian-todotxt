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
});
