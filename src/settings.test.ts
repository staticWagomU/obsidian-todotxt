import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";

describe("settings", () => {
	describe("DEFAULT_SETTINGS", () => {
		it("OpenRouter設定のデフォルト値が含まれる", () => {
			expect(DEFAULT_SETTINGS).toHaveProperty("openRouter");
			expect(DEFAULT_SETTINGS.openRouter).toHaveProperty("apiKey");
			expect(DEFAULT_SETTINGS.openRouter).toHaveProperty("model");
			expect(DEFAULT_SETTINGS.openRouter).toHaveProperty("includeCreationDate");
			expect(DEFAULT_SETTINGS.openRouter).toHaveProperty("customContexts");
			expect(DEFAULT_SETTINGS.openRouter).toHaveProperty("retryConfig");
		});

		it("OpenRouter APIキーのデフォルトは空文字", () => {
			expect(DEFAULT_SETTINGS.openRouter.apiKey).toBe("");
		});

		it("OpenRouterモデルのデフォルトはclaude-3-haiku", () => {
			expect(DEFAULT_SETTINGS.openRouter.model).toBe("anthropic/claude-3-haiku");
		});

		it("作成日付含めるのデフォルトはtrue", () => {
			expect(DEFAULT_SETTINGS.openRouter.includeCreationDate).toBe(true);
		});

		it("カスタムコンテキストのデフォルトは空オブジェクト", () => {
			expect(DEFAULT_SETTINGS.openRouter.customContexts).toEqual({});
		});

		it("リトライ設定のデフォルト値が正しい", () => {
			expect(DEFAULT_SETTINGS.openRouter.retryConfig.enabled).toBe(true);
			expect(DEFAULT_SETTINGS.openRouter.retryConfig.maxRetries).toBe(3);
			expect(DEFAULT_SETTINGS.openRouter.retryConfig.initialDelayMs).toBe(1000);
		});
	});
});
