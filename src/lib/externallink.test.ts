import { describe, expect, it } from "vitest";
import { extractExternalLinks } from "./externallink";

describe("extractExternalLinks", () => {
	describe("正常系: 基本[text](url)形式の外部リンク抽出", () => {
		it("[text](url)形式の基本的な外部リンク検出", () => {
			const description = "Check [GitHub](https://github.com) for details";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "GitHub", url: "https://github.com" }]);
		});

		it("文頭に[text](url)がある場合", () => {
			const description = "[Google](https://google.com) is a search engine";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "Google", url: "https://google.com" }]);
		});

		it("文末に[text](url)がある場合", () => {
			const description = "Visit the official site [here](https://example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "here", url: "https://example.com" }]);
		});

		it("日本語の表示テキスト[公式サイト](https://example.jp)を抽出", () => {
			const description = "詳細は[公式サイト](https://example.jp)を参照";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "公式サイト", url: "https://example.jp" }]);
		});
	});

	describe("正常系: 複数の外部リンクを抽出", () => {
		it("2つの外部リンク[Link1](url1)と[Link2](url2)を抽出", () => {
			const description = "Check [GitHub](https://github.com) and [GitLab](https://gitlab.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "GitHub", url: "https://github.com" },
				{ text: "GitLab", url: "https://gitlab.com" },
			]);
		});

		it("3つ以上の外部リンクを抽出", () => {
			const description = "[A](https://a.com), [B](https://b.com), and [C](https://c.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "A", url: "https://a.com" },
				{ text: "B", url: "https://b.com" },
				{ text: "C", url: "https://c.com" },
			]);
		});

		it("日本語リンクが複数[計画](https://plan.com)と[実行](https://exec.com)", () => {
			const description = "[計画](https://plan.com)を確認して[実行](https://exec.com)を進める";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "計画", url: "https://plan.com" },
				{ text: "実行", url: "https://exec.com" },
			]);
		});
	});

	describe("異常系: 外部リンクが存在しない、または不正な形式", () => {
		it("外部リンクが存在しない場合、空配列を返す", () => {
			const description = "No links in this text";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("空文字列の場合、空配列を返す", () => {
			const description = "";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});
	});
});
