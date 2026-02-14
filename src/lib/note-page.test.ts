import { describe, it, expect } from "vitest";
import {
	generatePageName,
	sanitizeFileName,
	formatTimestamp,
	generatePageContent,
	hasPageLink,
} from "./note-page";
import type { Todo } from "./todo";

describe("formatTimestamp", () => {
	it("should format date as YYYY-MM-DD HHmmss", () => {
		const date = new Date(2026, 1, 14, 15, 30, 45); // 2026-02-14 15:30:45
		expect(formatTimestamp(date)).toBe("2026-02-14 153045");
	});

	it("should pad single-digit values with zeros", () => {
		const date = new Date(2026, 0, 5, 3, 7, 9); // 2026-01-05 03:07:09
		expect(formatTimestamp(date)).toBe("2026-01-05 030709");
	});
});

describe("sanitizeFileName", () => {
	it("should remove forward slash", () => {
		expect(sanitizeFileName("a/b")).toBe("ab");
	});

	it("should remove backslash", () => {
		expect(sanitizeFileName("a\\b")).toBe("ab");
	});

	it("should remove colon", () => {
		expect(sanitizeFileName("a:b")).toBe("ab");
	});

	it("should remove asterisk", () => {
		expect(sanitizeFileName("a*b")).toBe("ab");
	});

	it("should remove question mark", () => {
		expect(sanitizeFileName("a?b")).toBe("ab");
	});

	it("should remove double quote", () => {
		expect(sanitizeFileName('a"b')).toBe("ab");
	});

	it("should remove angle brackets", () => {
		expect(sanitizeFileName("a<b>c")).toBe("abc");
	});

	it("should remove pipe", () => {
		expect(sanitizeFileName("a|b")).toBe("ab");
	});

	it("should handle multiple invalid characters", () => {
		expect(sanitizeFileName('file/name:with*bad?"chars<>|')).toBe("filenamewithbadchars");
	});

	it("should preserve valid characters including spaces and Japanese", () => {
		expect(sanitizeFileName("企画書を書く タスク")).toBe("企画書を書く タスク");
	});

	it("should trim whitespace", () => {
		expect(sanitizeFileName("  hello  ")).toBe("hello");
	});
});

describe("generatePageName", () => {
	it("should generate page name with description and timestamp", () => {
		const now = new Date(2026, 1, 14, 15, 30, 45);
		expect(generatePageName("企画書を書く", now)).toBe("企画書を書く 2026-02-14 153045.md");
	});

	it("should sanitize invalid characters in description", () => {
		const now = new Date(2026, 1, 14, 15, 30, 45);
		expect(generatePageName("file/with:bad*chars", now)).toBe("filewithbadchars 2026-02-14 153045.md");
	});

	it("should use current date when now is not provided", () => {
		const result = generatePageName("test task");
		expect(result).toMatch(/^test task \d{4}-\d{2}-\d{2} \d{6}\.md$/);
	});
});

describe("generatePageContent", () => {
	it("should generate template markdown with frontmatter", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-02-14",
			description: "企画書を書く +project @context due:2026-03-01",
			projects: ["project"],
			contexts: ["context"],
			tags: { due: "2026-03-01" },
			raw: "(A) 2026-02-14 企画書を書く +project @context due:2026-03-01",
		};

		const content = generatePageContent(todo);
		expect(content).toContain("---");
		expect(content).toContain('source_task: "(A) 2026-02-14 企画書を書く +project @context due:2026-03-01"');
		expect(content).toContain("created: 2026-02-14");
		expect(content).toContain("# 企画書を書く +project @context due:2026-03-01");
	});

	it("should use today as created date when creationDate is not set", () => {
		const todo: Todo = {
			completed: false,
			description: "simple task",
			projects: [],
			contexts: [],
			tags: {},
			raw: "simple task",
		};

		const content = generatePageContent(todo);
		const today = new Date().toISOString().split("T")[0]!;
		expect(content).toContain(`created: ${today}`);
	});

	it("should handle completed tasks", () => {
		const todo: Todo = {
			completed: true,
			completionDate: "2026-02-14",
			creationDate: "2026-02-10",
			description: "done task",
			projects: [],
			contexts: [],
			tags: {},
			raw: "x 2026-02-14 2026-02-10 done task",
		};

		const content = generatePageContent(todo);
		expect(content).toContain('source_task: "x 2026-02-14 2026-02-10 done task"');
	});
});

describe("hasPageLink", () => {
	it("should return true when description has an internal link", () => {
		const todo: Todo = {
			completed: false,
			description: "task with [[some page]] link",
			projects: [],
			contexts: [],
			tags: {},
			raw: "task with [[some page]] link",
		};

		expect(hasPageLink(todo)).toBe(true);
	});

	it("should return true when description has an external link", () => {
		const todo: Todo = {
			completed: false,
			description: "task with [page](page.md) link",
			projects: [],
			contexts: [],
			tags: {},
			raw: "task with [page](page.md) link",
		};

		expect(hasPageLink(todo)).toBe(true);
	});

	it("should return false when description has no links", () => {
		const todo: Todo = {
			completed: false,
			description: "plain task without links",
			projects: [],
			contexts: [],
			tags: {},
			raw: "plain task without links",
		};

		expect(hasPageLink(todo)).toBe(false);
	});

	it("should return true when description has both internal and external links", () => {
		const todo: Todo = {
			completed: false,
			description: "task [[page1]] and [page2](http://example.com)",
			projects: [],
			contexts: [],
			tags: {},
			raw: "task [[page1]] and [page2](http://example.com)",
		};

		expect(hasPageLink(todo)).toBe(true);
	});
});
