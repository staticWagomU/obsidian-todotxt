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

	describe("正常系: 様々なURLスキーム対応", () => {
		it("http://スキームのURLを検出", () => {
			const description = "Visit [HTTP Site](http://example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "HTTP Site", url: "http://example.com" }]);
		});

		it("https://スキームのURLを検出", () => {
			const description = "Visit [HTTPS Site](https://example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "HTTPS Site", url: "https://example.com" }]);
		});

		it("ftp://スキームのURLを検出", () => {
			const description = "Download from [FTP](ftp://ftp.example.com/file.txt)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "FTP", url: "ftp://ftp.example.com/file.txt" }]);
		});

		it("file://スキームのURLを検出", () => {
			const description = "Open [Local File](file:///Users/name/document.txt)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "Local File", url: "file:///Users/name/document.txt" }]);
		});

		it("mailto:スキームのURLを検出", () => {
			const description = "Contact [Email](mailto:test@example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "Email", url: "mailto:test@example.com" }]);
		});

		it("複数の異なるスキームが混在する場合", () => {
			const description = "[Web](https://example.com) and [Mail](mailto:test@example.com) and [FTP](ftp://ftp.example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "Web", url: "https://example.com" },
				{ text: "Mail", url: "mailto:test@example.com" },
				{ text: "FTP", url: "ftp://ftp.example.com" },
			]);
		});
	});

	describe("異常系: 不正な形式のリンクを除外", () => {
		it("開きブラケットのみ[textの場合、空配列を返す", () => {
			const description = "Incomplete [text without closing";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("開き括弧なし[text]urlの場合、空配列を返す", () => {
			const description = "Incomplete [text]url";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("閉じ括弧なし[text](urlの場合、空配列を返す", () => {
			const description = "Incomplete [text](url without closing";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("空のテキスト[](url)の場合、空配列を返す", () => {
			const description = "Empty text [](https://example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("空のURL[text]()の場合、空配列を返す", () => {
			const description = "Empty URL [text]()";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});

		it("両方空[]()の場合、空配列を返す", () => {
			const description = "Both empty []()";
			const result = extractExternalLinks(description);
			expect(result).toEqual([]);
		});
	});

	describe("境界値: エッジケース処理", () => {
		it("テキストにスペースが含まれる[some text](url)を抽出", () => {
			const description = "Link [some text](https://example.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "some text", url: "https://example.com" }]);
		});

		it("URLにスペースが含まれる場合も抽出(技術的には許容)", () => {
			const description = "Link [text](https://example.com/path with space)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "text", url: "https://example.com/path with space" }]);
		});

		it("連続したリンク[Link1](url1)[Link2](url2)を抽出", () => {
			const description = "[Link1](https://a.com)[Link2](https://b.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "Link1", url: "https://a.com" },
				{ text: "Link2", url: "https://b.com" },
			]);
		});

		it("改行を含むテキスト内の複数リンク", () => {
			const description = "Line1 [Link1](https://a.com)\nLine2 [Link2](https://b.com)";
			const result = extractExternalLinks(description);
			expect(result).toEqual([
				{ text: "Link1", url: "https://a.com" },
				{ text: "Link2", url: "https://b.com" },
			]);
		});

		it("正常なリンク[Link](url)と不正形式[textの混在", () => {
			const description = "Valid [Link](https://example.com) and invalid [text";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "Link", url: "https://example.com" }]);
		});

		it("正常なリンク[Link](url)と空リンク[]()の混在", () => {
			const description = "[Link](https://example.com) and []()";
			const result = extractExternalLinks(description);
			expect(result).toEqual([{ text: "Link", url: "https://example.com" }]);
		});
	});
});
