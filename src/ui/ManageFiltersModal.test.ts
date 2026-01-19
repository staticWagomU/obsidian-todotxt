/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";
import { ManageFiltersModal, type ManageFiltersModalOptions } from "./ManageFiltersModal";
import type { FilterPreset } from "../lib/filter-preset";
import type { FilterState } from "../lib/rendering";

// Mock App object
const createMockApp = () => ({
	workspace: {},
	vault: {},
	metadataCache: {},
});

describe("ManageFiltersModal", () => {
	const createFilterState = (overrides?: Partial<FilterState>): FilterState => ({
		priority: "all",
		search: "",
		group: "none",
		sort: "default",
		status: "all",
		...overrides,
	});

	const createPreset = (id: string, name: string, filterState?: FilterState): FilterPreset => ({
		id,
		name,
		filterState: filterState || createFilterState(),
		createdAt: Date.now(),
		updatedAt: Date.now(),
	});

	const createModalOptions = (
		overrides?: Partial<ManageFiltersModalOptions>,
	): ManageFiltersModalOptions => ({
		presets: [],
		onUpdate: vi.fn(),
		onDelete: vi.fn(),
		onApply: vi.fn(),
		onSetDefault: vi.fn(),
		currentFilePath: "vault/todo.txt",
		currentDefaultPresetId: undefined,
		...overrides,
	});

	describe("constructor", () => {
		it("should create modal with presets", () => {
			const presets = [
				createPreset("preset-1", "Filter A"),
				createPreset("preset-2", "Filter B"),
			];
			const options = createModalOptions({ presets });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			expect(modal).toBeDefined();
			expect(modal.presets).toHaveLength(2);
		});
	});

	describe("getPresetList", () => {
		it("should return list of presets for display", () => {
			const presets = [
				createPreset("preset-1", "Filter A", createFilterState({ priority: "A" })),
				createPreset("preset-2", "Filter B", createFilterState({ search: "work" })),
			];
			const options = createModalOptions({ presets });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			const list = modal.getPresetList();

			expect(list).toHaveLength(2);
			expect(list[0]?.id).toBe("preset-1");
			expect(list[0]?.name).toBe("Filter A");
			expect(list[1]?.id).toBe("preset-2");
			expect(list[1]?.name).toBe("Filter B");
		});

		it("should return empty array when no presets", () => {
			const options = createModalOptions({ presets: [] });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			const list = modal.getPresetList();

			expect(list).toHaveLength(0);
		});
	});

	describe("triggerUpdate", () => {
		it("should call onUpdate with preset id and new name", () => {
			const onUpdate = vi.fn();
			const presets = [createPreset("preset-1", "Old Name")];
			const options = createModalOptions({ presets, onUpdate });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerUpdate("preset-1", "New Name");

			expect(onUpdate).toHaveBeenCalledWith("preset-1", "New Name");
		});
	});

	describe("triggerDelete", () => {
		it("should call onDelete with preset id", () => {
			const onDelete = vi.fn();
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({ presets, onDelete });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerDelete("preset-1");

			expect(onDelete).toHaveBeenCalledWith("preset-1");
		});
	});

	describe("triggerApply", () => {
		it("should call onApply with filter state", () => {
			const onApply = vi.fn();
			const filterState = createFilterState({ priority: "A", search: "test" });
			const presets = [createPreset("preset-1", "Filter A", filterState)];
			const options = createModalOptions({ presets, onApply });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerApply("preset-1");

			expect(onApply).toHaveBeenCalledWith(filterState);
		});

		it("should not call onApply when preset not found", () => {
			const onApply = vi.fn();
			const options = createModalOptions({ presets: [], onApply });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerApply("nonexistent");

			expect(onApply).not.toHaveBeenCalled();
		});
	});

	describe("triggerSetDefault", () => {
		it("should call onSetDefault with preset id and file path", () => {
			const onSetDefault = vi.fn();
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({
				presets,
				onSetDefault,
				currentFilePath: "vault/todo.txt",
			});
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerSetDefault("preset-1");

			expect(onSetDefault).toHaveBeenCalledWith("preset-1", "vault/todo.txt");
		});

		it("should call onSetDefault with undefined to clear default", () => {
			const onSetDefault = vi.fn();
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({
				presets,
				onSetDefault,
				currentFilePath: "vault/todo.txt",
			});
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			modal.triggerClearDefault();

			expect(onSetDefault).toHaveBeenCalledWith(undefined, "vault/todo.txt");
		});
	});

	describe("isDefaultPreset", () => {
		it("should return true when preset is default for current file", () => {
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({
				presets,
				currentDefaultPresetId: "preset-1",
			});
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			expect(modal.isDefaultPreset("preset-1")).toBe(true);
		});

		it("should return false when preset is not default", () => {
			const presets = [
				createPreset("preset-1", "Filter A"),
				createPreset("preset-2", "Filter B"),
			];
			const options = createModalOptions({
				presets,
				currentDefaultPresetId: "preset-2",
			});
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			expect(modal.isDefaultPreset("preset-1")).toBe(false);
		});

		it("should return false when no default is set", () => {
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({
				presets,
				currentDefaultPresetId: undefined,
			});
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			expect(modal.isDefaultPreset("preset-1")).toBe(false);
		});
	});

	describe("validation", () => {
		it("should not allow empty name on update", () => {
			const presets = [createPreset("preset-1", "Original Name")];
			const options = createModalOptions({ presets });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			const result = modal.validateName("", "preset-1");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("名前を入力してください");
		});

		it("should not allow duplicate name on update", () => {
			const presets = [
				createPreset("preset-1", "Filter A"),
				createPreset("preset-2", "Filter B"),
			];
			const options = createModalOptions({ presets });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			const result = modal.validateName("Filter B", "preset-1");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("この名前は既に使用されています");
		});

		it("should allow keeping same name on update", () => {
			const presets = [createPreset("preset-1", "Filter A")];
			const options = createModalOptions({ presets });
			const modal = new ManageFiltersModal(createMockApp() as any, options);

			const result = modal.validateName("Filter A", "preset-1");

			expect(result.valid).toBe(true);
		});
	});
});
