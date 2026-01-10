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
});
