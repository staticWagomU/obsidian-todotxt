import { describe, expect, it } from "vitest";
import { extractInternalLinks } from "./internallink";

describe("extractInternalLinks", () => {
	describe("正常系: 基本[[NoteName]]形式のwikilink抽出", () => {
		it("[[NoteName]]形式の基本的なwikilink検出", () => {
			const description = "Check [[ProjectPlan]] for details";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "ProjectPlan" }]);
		});

		it("文頭に[[NoteName]]がある場合", () => {
			const description = "[[TaskList]] needs updating";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "TaskList" }]);
		});

		it("文末に[[NoteName]]がある場合", () => {
			const description = "Refer to [[Documentation]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Documentation" }]);
		});

		it("日本語のノート名[[プロジェクト計画]]を抽出", () => {
			const description = "詳細は[[プロジェクト計画]]を参照";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "プロジェクト計画" }]);
		});
	});

	describe("異常系: wikilinkが存在しない、または不正な形式", () => {
		it("wikilinkが存在しない場合、空配列を返す", () => {
			const description = "No links in this text";
			const result = extractInternalLinks(description);
			expect(result).toEqual([]);
		});

		it("空文字列の場合、空配列を返す", () => {
			const description = "";
			const result = extractInternalLinks(description);
			expect(result).toEqual([]);
		});

		it("開きブラケットのみ[[の場合、空配列を返す", () => {
			const description = "Incomplete [[ bracket";
			const result = extractInternalLinks(description);
			expect(result).toEqual([]);
		});

		it("閉じブラケットのみ]]の場合、空配列を返す", () => {
			const description = "Incomplete ]] bracket";
			const result = extractInternalLinks(description);
			expect(result).toEqual([]);
		});

		it("空のwikilink[[]]の場合、空配列を返す", () => {
			const description = "Empty [[]] link";
			const result = extractInternalLinks(description);
			expect(result).toEqual([]);
		});
	});

	describe("境界値: 特殊文字やスペース", () => {
		it("ノート名にスペースが含まれる[[Note Name]]を抽出", () => {
			const description = "See [[Note Name]] for info";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note Name" }]);
		});

		it("ノート名にハイフン[[Project-2026]]を抽出", () => {
			const description = "Check [[Project-2026]] status";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Project-2026" }]);
		});

		it("ノート名にアンダースコア[[task_list]]を抽出", () => {
			const description = "Update [[task_list]] today";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "task_list" }]);
		});
	});

	describe("正常系: エイリアス[[NoteName|Display Text]]形式の抽出", () => {
		it("[[NoteName|alias]]形式のエイリアス付きwikilink検出", () => {
			const description = "Check [[ProjectPlan|the plan]] for details";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "ProjectPlan", alias: "the plan" }]);
		});

		it("エイリアスが日本語[[Note|メモ]]の場合", () => {
			const description = "See [[Documentation|ドキュメント]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Documentation", alias: "ドキュメント" }]);
		});

		it("ノート名とエイリアスの両方が日本語[[プロジェクト|計画書]]", () => {
			const description = "詳細は[[プロジェクト計画|計画書]]を参照";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "プロジェクト計画", alias: "計画書" }]);
		});

		it("エイリアスにスペースが含まれる[[Note|Display Text]]", () => {
			const description = "Read [[TaskList|Task List for Today]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "TaskList", alias: "Task List for Today" }]);
		});
	});

	describe("異常系: エイリアス形式の不正なケース", () => {
		it("パイプのみ[[NoteName|]]の場合、aliasは空文字列", () => {
			const description = "Check [[ProjectPlan|]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "ProjectPlan", alias: "" }]);
		});

		it("パイプのみ[[|alias]]の場合、linkは空文字列", () => {
			const description = "See [[|display text]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "", alias: "display text" }]);
		});

		it("複数のパイプ[[Note|alias1|alias2]]の場合、最初のパイプで分割", () => {
			const description = "Check [[Note|alias1|alias2]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note", alias: "alias1|alias2" }]);
		});
	});

	describe("正常系: 複数の内部リンクを抽出", () => {
		it("2つの内部リンク[[Note1]]と[[Note2]]を抽出", () => {
			const description = "Check [[Note1]] and [[Note2]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note1" }, { link: "Note2" }]);
		});

		it("基本形式とエイリアス形式が混在[[Note1]]と[[Note2|alias]]", () => {
			const description = "See [[ProjectPlan]] and [[TaskList|tasks]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([
				{ link: "ProjectPlan" },
				{ link: "TaskList", alias: "tasks" },
			]);
		});

		it("3つ以上の内部リンクを抽出", () => {
			const description = "[[A]], [[B|b]], and [[C]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([
				{ link: "A" },
				{ link: "B", alias: "b" },
				{ link: "C" },
			]);
		});

		it("日本語リンクが複数[[計画]]と[[実行|タスク]]", () => {
			const description = "[[計画]]を確認して[[実行|タスク]]を進める";
			const result = extractInternalLinks(description);
			expect(result).toEqual([
				{ link: "計画" },
				{ link: "実行", alias: "タスク" },
			]);
		});
	});

	describe("境界値: 複数リンクと不正形式の組み合わせ", () => {
		it("正常なリンク[[Note1]]と開きブラケットのみ[[の混在", () => {
			const description = "Check [[Note1]] and [[ incomplete";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note1" }]);
		});

		it("正常なリンク[[Note1]]と空リンク[[]]の混在", () => {
			const description = "[[Note1]] and [[]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note1" }]);
		});

		it("連続したリンク[[Note1]][[Note2]]を抽出", () => {
			const description = "[[Note1]][[Note2]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note1" }, { link: "Note2" }]);
		});
	});

	describe("境界値: ネストしたブラケットと特殊ケース", () => {
		it("ブラケットを含むテキスト内の[[Note]]を抽出", () => {
			const description = "Text [not link] and [[Note]] here";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note" }]);
		});

		it("改行を含むテキスト内の複数リンク", () => {
			const description = "Line1 [[Note1]]\nLine2 [[Note2]]";
			const result = extractInternalLinks(description);
			expect(result).toEqual([{ link: "Note1" }, { link: "Note2" }]);
		});
	});
});
