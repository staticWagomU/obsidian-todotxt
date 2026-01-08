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
