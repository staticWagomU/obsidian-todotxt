import { describe, it, expect, vi } from "vitest";
import { getSearchHelpContent } from "./SearchHelpModal";

// Mock Obsidian modules
vi.mock("obsidian", () => {
	return {
		Modal: class {
			app: unknown;
			contentEl: HTMLElement;

			constructor(app: unknown) {
				this.app = app;
				this.contentEl = document.createElement("div");
			}

			open(): void {}
			close(): void {}
		},
	};
});

describe("SearchHelpModal", () => {
	describe("getSearchHelpContent", () => {
		it("検索ヘルプコンテンツにAND検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("AND");
			expect(content).toContain("空白");
		});

		it("検索ヘルプコンテンツにOR検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("OR");
			expect(content).toContain("|");
		});

		it("検索ヘルプコンテンツにNOT検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("NOT");
			expect(content).toContain("-");
		});

		it("検索ヘルプコンテンツに正規表現検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("/pattern/");
		});

		it("検索ヘルプコンテンツに特殊構文検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("project:");
			expect(content).toContain("context:");
			expect(content).toContain("priority:");
			expect(content).toContain("due:");
		});

		it("検索ヘルプコンテンツに日付範囲検索の説明が含まれる", () => {
			const content = getSearchHelpContent();
			expect(content).toContain("..");
		});

		it("検索ヘルプコンテンツに具体例が含まれる", () => {
			const content = getSearchHelpContent();
			// Examples should be present
			expect(content).toContain("Buy");
		});
	});
});
