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
