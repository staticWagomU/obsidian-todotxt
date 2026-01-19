import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, type TodotxtPluginSettings } from "./settings";
import type { FilterPreset } from "./lib/filter-preset";
import type { FilterState } from "./lib/rendering";

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

		it("savedFiltersのデフォルトは空配列", () => {
			expect(DEFAULT_SETTINGS).toHaveProperty("savedFilters");
			expect(DEFAULT_SETTINGS.savedFilters).toEqual([]);
		});
	});

	describe("savedFilters setting", () => {
		it("savedFilters should be typed as FilterPreset[]", () => {
			// Type check: savedFilters should accept FilterPreset array
			const filterState: FilterState = {
				priority: "A",
				search: "test",
				group: "none",
				sort: "default",
				status: "all",
			};
			const preset: FilterPreset = {
				id: "test-1",
				name: "Test Preset",
				filterState,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				savedFilters: [preset],
			};

			expect(settings.savedFilters).toHaveLength(1);
			expect(settings.savedFilters[0]?.name).toBe("Test Preset");
			expect(settings.savedFilters[0]?.filterState.priority).toBe("A");
		});

		it("savedFilters should persist multiple presets", () => {
			const filterState1: FilterState = {
				priority: "A",
				search: "",
				group: "none",
				sort: "default",
				status: "all",
			};
			const filterState2: FilterState = {
				priority: "B",
				search: "work",
				group: "project",
				sort: "completion",
				status: "active",
			};

			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				savedFilters: [
					{
						id: "preset-1",
						name: "High Priority",
						filterState: filterState1,
						createdAt: 1000,
						updatedAt: 1000,
					},
					{
						id: "preset-2",
						name: "Work Tasks",
						filterState: filterState2,
						createdAt: 2000,
						updatedAt: 2000,
					},
				],
			};

			expect(settings.savedFilters).toHaveLength(2);
			expect(settings.savedFilters[0]?.name).toBe("High Priority");
			expect(settings.savedFilters[1]?.name).toBe("Work Tasks");
		});
	});
});
