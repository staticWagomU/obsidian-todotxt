import { describe, it, expect } from "vitest";
import {
	DEFAULT_SETTINGS,
	type TodotxtPluginSettings,
	getDefaultFilterForFile,
	type DailyNoteInsertPosition,
} from "./settings";
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

	describe("fileDefaultFilters setting", () => {
		it("fileDefaultFiltersのデフォルトは空オブジェクト", () => {
			expect(DEFAULT_SETTINGS).toHaveProperty("fileDefaultFilters");
			expect(DEFAULT_SETTINGS.fileDefaultFilters).toEqual({});
		});

		it("should map file path to preset id", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				fileDefaultFilters: {
					"vault/todo.txt": "preset-1",
					"vault/work.txt": "preset-2",
				},
			};

			expect(settings.fileDefaultFilters["vault/todo.txt"]).toBe("preset-1");
			expect(settings.fileDefaultFilters["vault/work.txt"]).toBe("preset-2");
		});
	});

	describe("getDefaultFilterForFile", () => {
		const createTestSettings = (): TodotxtPluginSettings => {
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

			return {
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
				fileDefaultFilters: {
					"vault/todo.txt": "preset-1",
					"vault/work.txt": "preset-2",
				},
			};
		};

		it("should return the filter state for a file with default filter set", () => {
			const settings = createTestSettings();

			const result = getDefaultFilterForFile(settings, "vault/todo.txt");

			expect(result).not.toBeUndefined();
			expect(result?.priority).toBe("A");
		});

		it("should return different filter states for different files", () => {
			const settings = createTestSettings();

			const result1 = getDefaultFilterForFile(settings, "vault/todo.txt");
			const result2 = getDefaultFilterForFile(settings, "vault/work.txt");

			expect(result1?.priority).toBe("A");
			expect(result2?.priority).toBe("B");
			expect(result2?.search).toBe("work");
		});

		it("should return undefined when file has no default filter", () => {
			const settings = createTestSettings();

			const result = getDefaultFilterForFile(settings, "vault/other.txt");

			expect(result).toBeUndefined();
		});

		it("should return undefined when preset id is invalid", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				savedFilters: [],
				fileDefaultFilters: {
					"vault/todo.txt": "nonexistent-preset",
				},
			};

			const result = getDefaultFilterForFile(settings, "vault/todo.txt");

			expect(result).toBeUndefined();
		});

		it("should return undefined when fileDefaultFilters is empty", () => {
			const settings: TodotxtPluginSettings = {
				...DEFAULT_SETTINGS,
				savedFilters: [],
				fileDefaultFilters: {},
			};

			const result = getDefaultFilterForFile(settings, "vault/todo.txt");

			expect(result).toBeUndefined();
		});
	});

	describe("Daily Notes Integration Settings", () => {
		describe("DailyNoteInsertPosition type", () => {
			it("should accept 'top' as valid insert position", () => {
				const position: DailyNoteInsertPosition = "top";
				expect(position).toBe("top");
			});

			it("should accept 'bottom' as valid insert position", () => {
				const position: DailyNoteInsertPosition = "bottom";
				expect(position).toBe("bottom");
			});

			it("should accept 'cursor' as valid insert position", () => {
				const position: DailyNoteInsertPosition = "cursor";
				expect(position).toBe("cursor");
			});
		});

		describe("dailyNotes settings", () => {
			it("should have default dailyNotes settings", () => {
				expect(DEFAULT_SETTINGS).toHaveProperty("dailyNotes");
				expect(DEFAULT_SETTINGS.dailyNotes).toHaveProperty("insertPosition");
				expect(DEFAULT_SETTINGS.dailyNotes).toHaveProperty("taskPrefix");
			});

			it("should have 'bottom' as default insert position", () => {
				expect(DEFAULT_SETTINGS.dailyNotes.insertPosition).toBe("bottom");
			});

			it("should have '- [ ] ' as default task prefix", () => {
				expect(DEFAULT_SETTINGS.dailyNotes.taskPrefix).toBe("- [ ] ");
			});

			it("should allow configuring insert position in settings", () => {
				const settings: TodotxtPluginSettings = {
					...DEFAULT_SETTINGS,
					dailyNotes: {
						...DEFAULT_SETTINGS.dailyNotes,
						insertPosition: "top",
					},
				};

				expect(settings.dailyNotes.insertPosition).toBe("top");
			});

			it("should allow configuring task prefix in settings", () => {
				const settings: TodotxtPluginSettings = {
					...DEFAULT_SETTINGS,
					dailyNotes: {
						...DEFAULT_SETTINGS.dailyNotes,
						taskPrefix: "- ",
					},
				};

				expect(settings.dailyNotes.taskPrefix).toBe("- ");
			});
		});
	});
});
