/**
 * decompose-prompt.ts - タスク分解プロンプト テスト
 * TDD RED Phase: Subtask 2 - AC2, AC5対応
 */

import { describe, it, expect } from "vitest";

describe("buildDecomposePrompt - タスク分解プロンプト構築", () => {
	it("buildDecomposePrompt関数が存在する", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		expect(buildDecomposePrompt).toBeDefined();
	});

	it("タスク説明を含むプロンプトを生成する", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"大規模なプロジェクトを完了する",
			"2026-01-20",
		);
		expect(result).toContain("大規模なプロジェクトを完了する");
	});

	it("現在日付を含むプロンプトを生成する", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明",
			"2026-01-20",
		);
		expect(result).toContain("2026-01-20");
	});

	it("3-7個のサブタスク生成指示を含む", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明",
			"2026-01-20",
		);
		expect(result).toMatch(/3.*7|3-7/);
	});

	it("todo.txt形式の出力指示を含む", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明",
			"2026-01-20",
		);
		expect(result).toContain("todo.txt");
	});

	it("カスタム指示がある場合はプロンプトに含める", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明",
			"2026-01-20",
			"技術的なステップに分解してください",
		);
		expect(result).toContain("技術的なステップに分解してください");
	});

	it("カスタム指示がない場合でもプロンプトを生成できる", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明",
			"2026-01-20",
		);
		expect(result).toBeDefined();
		expect(result.length).toBeGreaterThan(0);
	});

	it("プロジェクト情報を含める場合のプロンプト生成", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明 +projectA",
			"2026-01-20",
			undefined,
			["projectA"],
		);
		expect(result).toContain("+projectA");
	});

	it("コンテキスト情報を含める場合のプロンプト生成", async () => {
		const { buildDecomposePrompt } = await import("./decompose-prompt");
		const result = buildDecomposePrompt(
			"タスク説明 @home",
			"2026-01-20",
			undefined,
			undefined,
			["home"],
		);
		expect(result).toContain("@home");
	});
});

describe("parseDecomposeResponse - AI応答のパース", () => {
	it("parseDecomposeResponse関数が存在する", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		expect(parseDecomposeResponse).toBeDefined();
	});

	it("複数行のtodo.txt形式を配列にパースする", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		const response = `要件定義を作成する
設計書を作成する
実装する`;
		const result = parseDecomposeResponse(response);
		expect(result).toHaveLength(3);
		expect(result[0]).toBe("要件定義を作成する");
	});

	it("空行を除外する", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		const response = `タスク1

タスク2

タスク3`;
		const result = parseDecomposeResponse(response);
		expect(result).toHaveLength(3);
	});

	it("前後の空白をトリムする", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		const response = `  タスク1  
   タスク2   `;
		const result = parseDecomposeResponse(response);
		expect(result[0]).toBe("タスク1");
		expect(result[1]).toBe("タスク2");
	});

	it("番号付きリストから番号を除去する", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		const response = `1. タスク1
2. タスク2
3. タスク3`;
		const result = parseDecomposeResponse(response);
		expect(result[0]).toBe("タスク1");
		expect(result[1]).toBe("タスク2");
	});

	it("ハイフン付きリストからハイフンを除去する", async () => {
		const { parseDecomposeResponse } = await import("./decompose-prompt");
		const response = `- タスク1
- タスク2`;
		const result = parseDecomposeResponse(response);
		expect(result[0]).toBe("タスク1");
		expect(result[1]).toBe("タスク2");
	});
});
