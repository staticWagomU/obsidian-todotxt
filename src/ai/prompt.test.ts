import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompt";

describe("prompt", () => {
	describe("buildSystemPrompt", () => {
		it("現在日付が埋め込まれたプロンプトを生成する", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("2026-01-14");
			expect(prompt).toContain("作成日は 2026-01-14 を使用");
		});

		it("デフォルトコンテキストマッピングが含まれる", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("#pc → @pc");
			expect(prompt).toContain("#phone → @phone");
			expect(prompt).toContain("#home → @home");
			expect(prompt).toContain("#office → @office");
			expect(prompt).toContain("#email → @email");
		});

		it("カスタムコンテキストマッピングが追加される", () => {
			const currentDate = "2026-01-14";
			const customContexts = {
				パソコン: "pc",
				買い物: "shopping",
			};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("#パソコン → @pc");
			expect(prompt).toContain("#買い物 → @shopping");
		});

		it("プロジェクト判定ルールが含まれる", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("〇〇についてです");
			expect(prompt).toContain("〇〇の件");
			expect(prompt).toContain("〇〇関連");
		});

		it("優先度判定ルールが含まれる", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("緊急");
			expect(prompt).toContain("(A)");
			expect(prompt).toContain("重要");
			expect(prompt).toContain("(B)");
			expect(prompt).toContain("急ぎ");
			expect(prompt).toContain("(C)");
		});

		it("期限判定ルールが含まれる", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("due:YYYY-MM-DD");
			expect(prompt).toContain("今日: 2026-01-14");
		});

		it("todo.txt形式ルールが含まれる", () => {
			const currentDate = "2026-01-14";
			const customContexts = {};

			const prompt = buildSystemPrompt(currentDate, customContexts);

			expect(prompt).toContain("+ProjectName");
			expect(prompt).toContain("@context");
			expect(prompt).toContain("YYYY-MM-DD");
		});
	});
});
