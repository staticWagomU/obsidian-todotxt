import { describe, expect, it, vi, beforeEach } from "vitest";
import { SaveFilterModal, type SaveFilterModalOptions } from "./SaveFilterModal";
import type { FilterState } from "../lib/rendering";

// Mock App object
const createMockApp = () => ({
	workspace: {},
	vault: {},
	metadataCache: {},
});

describe("SaveFilterModal", () => {
	const mockFilterState: FilterState = {
		priority: "A",
		search: "test",
		group: "project",
		sort: "completion",
		status: "active",
	};

	const createModalOptions = (
		overrides?: Partial<SaveFilterModalOptions>,
	): SaveFilterModalOptions => ({
		filterState: mockFilterState,
		onSave: vi.fn(),
		existingPresetNames: [],
		...overrides,
	});

	describe("constructor", () => {
		it("should create modal with filter state", () => {
			const options = createModalOptions();
			const modal = new SaveFilterModal(createMockApp() as any, options);

			expect(modal).toBeDefined();
			expect(modal.filterState).toEqual(mockFilterState);
		});

		it("should accept onSave callback", () => {
			const onSave = vi.fn();
			const options = createModalOptions({ onSave });
			const modal = new SaveFilterModal(createMockApp() as any, options);

			expect(modal.onSaveCallback).toBe(onSave);
		});
	});

	describe("validation", () => {
		it("should not allow empty name", () => {
			const options = createModalOptions();
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("名前を入力してください");
		});

		it("should not allow whitespace-only name", () => {
			const options = createModalOptions();
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("   ");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("名前を入力してください");
		});

		it("should not allow duplicate name", () => {
			const options = createModalOptions({
				existingPresetNames: ["Existing Filter", "Another Filter"],
			});
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("Existing Filter");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("この名前は既に使用されています");
		});

		it("should allow duplicate check to be case-insensitive", () => {
			const options = createModalOptions({
				existingPresetNames: ["Existing Filter"],
			});
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("existing filter");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("この名前は既に使用されています");
		});

		it("should accept valid name", () => {
			const options = createModalOptions({
				existingPresetNames: ["Existing Filter"],
			});
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("New Filter");

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should accept name with leading/trailing spaces (trimmed)", () => {
			const options = createModalOptions();
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const result = modal.validateName("  New Filter  ");

			expect(result.valid).toBe(true);
		});
	});

	describe("onSave callback", () => {
		it("should call onSave with name and filter state when save is triggered", () => {
			const onSave = vi.fn();
			const options = createModalOptions({ onSave });
			const modal = new SaveFilterModal(createMockApp() as any, options);

			modal.triggerSave("My Filter");

			expect(onSave).toHaveBeenCalledWith("My Filter", mockFilterState);
		});

		it("should trim name before calling onSave", () => {
			const onSave = vi.fn();
			const options = createModalOptions({ onSave });
			const modal = new SaveFilterModal(createMockApp() as any, options);

			modal.triggerSave("  My Filter  ");

			expect(onSave).toHaveBeenCalledWith("My Filter", mockFilterState);
		});
	});

	describe("filter state display", () => {
		it("should provide formatted filter summary for display", () => {
			const options = createModalOptions({
				filterState: {
					priority: "A",
					search: "work project",
					group: "project",
					sort: "completion",
					status: "active",
				},
			});
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const summary = modal.getFilterSummary();

			expect(summary).toContain("優先度: A");
			expect(summary).toContain("検索: work project");
			expect(summary).toContain("グループ: プロジェクト");
			expect(summary).toContain("ソート: 未完了→完了");
			expect(summary).toContain("ステータス: 未完了");
		});

		it("should handle default filter values in summary", () => {
			const options = createModalOptions({
				filterState: {
					priority: "all",
					search: "",
					group: "none",
					sort: "default",
					status: "all",
				},
			});
			const modal = new SaveFilterModal(createMockApp() as any, options);

			const summary = modal.getFilterSummary();

			expect(summary).toContain("優先度: 全て");
			expect(summary).toContain("検索: (なし)");
			expect(summary).toContain("グループ: なし");
			expect(summary).toContain("ソート: デフォルト");
			expect(summary).toContain("ステータス: 全て");
		});
	});
});
