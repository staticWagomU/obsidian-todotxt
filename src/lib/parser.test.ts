import { describe, it, expect } from "vitest";
import { parseTodoLine } from "./parser";

describe("parse completion", () => {
	it("行頭にxがある場合、completedがtrueになる", () => {
		const result = parseTodoLine("x Buy milk");
		expect(result.completed).toBe(true);
	});

	it("行頭にxがない場合、completedがfalseになる", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.completed).toBe(false);
	});

	it("完了マークは行頭のx+スペースのみ有効", () => {
		const result1 = parseTodoLine("x Buy milk");
		expect(result1.completed).toBe(true);

		const result2 = parseTodoLine("Buy x milk");
		expect(result2.completed).toBe(false);
	});
});

describe("parse priority", () => {
	it("行頭の(A)-(Z)を優先度としてパース", () => {
		const result = parseTodoLine("(A) Call Mom");
		expect(result.priority).toBe("A");
	});

	it("完了マーク後の優先度をパース", () => {
		const result = parseTodoLine("x (B) 2026-01-08 Call Mom");
		expect(result.priority).toBe("B");
	});

	it("優先度がない場合はundefined", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.priority).toBeUndefined();
	});

	it("小文字や範囲外の優先度は無効", () => {
		const result1 = parseTodoLine("(a) Invalid priority");
		expect(result1.priority).toBeUndefined();

		const result2 = parseTodoLine("(1) Invalid priority");
		expect(result2.priority).toBeUndefined();
	});

	it("説明文の途中の(A)は無視", () => {
		const result = parseTodoLine("Call (A) Mom");
		expect(result.priority).toBeUndefined();
	});
});

describe("parse dates", () => {
	it("作成日のみの場合", () => {
		const result = parseTodoLine("2026-01-08 Buy milk");
		expect(result.creationDate).toBe("2026-01-08");
		expect(result.completionDate).toBeUndefined();
	});

	it("完了タスクの完了日と作成日", () => {
		const result = parseTodoLine("x 2026-01-08 2026-01-01 Buy milk");
		expect(result.completionDate).toBe("2026-01-08");
		expect(result.creationDate).toBe("2026-01-01");
	});

	it("優先度と作成日の組み合わせ", () => {
		const result = parseTodoLine("(A) 2026-01-08 Call Mom");
		expect(result.priority).toBe("A");
		expect(result.creationDate).toBe("2026-01-08");
	});

	it("完了+優先度+日付の組み合わせ", () => {
		const result = parseTodoLine("x (B) 2026-01-08 2026-01-01 Task");
		expect(result.completed).toBe(true);
		expect(result.priority).toBe("B");
		expect(result.completionDate).toBe("2026-01-08");
		expect(result.creationDate).toBe("2026-01-01");
	});

	it("日付がない場合はundefined", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.creationDate).toBeUndefined();
		expect(result.completionDate).toBeUndefined();
	});

	it("YYYY-MM-DD形式以外は無効", () => {
		const result = parseTodoLine("01-08-2026 Invalid date");
		expect(result.creationDate).toBeUndefined();
	});
});

describe("parse project context", () => {
	it("+記号で始まるプロジェクトを抽出", () => {
		const result = parseTodoLine("Buy milk +GroceryShopping");
		expect(result.projects).toEqual(["GroceryShopping"]);
	});

	it("@記号で始まるコンテキストを抽出", () => {
		const result = parseTodoLine("Call Mom @phone");
		expect(result.contexts).toEqual(["phone"]);
	});

	it("複数のプロジェクトとコンテキストを抽出", () => {
		const result = parseTodoLine(
			"Email report +ProjectA +ProjectB @work @email",
		);
		expect(result.projects).toEqual(["ProjectA", "ProjectB"]);
		expect(result.contexts).toEqual(["work", "email"]);
	});

	it("説明文の途中のプロジェクト・コンテキストも抽出", () => {
		const result = parseTodoLine("Review +ProjectX code @office");
		expect(result.projects).toEqual(["ProjectX"]);
		expect(result.contexts).toEqual(["office"]);
	});

	it("プロジェクト・コンテキストがない場合は空配列", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.projects).toEqual([]);
		expect(result.contexts).toEqual([]);
	});

	it("スペースが続く場合は無効", () => {
		const result = parseTodoLine("Task + invalid @ invalid");
		expect(result.projects).toEqual([]);
		expect(result.contexts).toEqual([]);
	});
});
