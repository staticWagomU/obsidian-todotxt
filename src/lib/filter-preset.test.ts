import { describe, expect, it } from "vitest";
import type { FilterState } from "./rendering";
import {
	type FilterPreset,
	createPreset,
	updatePreset,
	deletePreset,
	getPresetById,
} from "./filter-preset";

describe("FilterPreset type and CRUD functions", () => {
	// Helper to create a filter state for testing
	const createFilterState = (overrides?: Partial<FilterState>): FilterState => ({
		priority: "all",
		search: "",
		group: "none",
		sort: "default",
		status: "all",
		...overrides,
	});

	describe("FilterPreset type", () => {
		it("should have required fields: id, name, filterState, createdAt, updatedAt", () => {
			const preset: FilterPreset = {
				id: "preset-1",
				name: "My Filter",
				filterState: createFilterState({ priority: "A", search: "work" }),
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			expect(preset.id).toBe("preset-1");
			expect(preset.name).toBe("My Filter");
			expect(preset.filterState.priority).toBe("A");
			expect(preset.filterState.search).toBe("work");
			expect(typeof preset.createdAt).toBe("number");
			expect(typeof preset.updatedAt).toBe("number");
		});
	});

	describe("createPreset", () => {
		it("should create a new preset with unique id", () => {
			const presets: FilterPreset[] = [];
			const filterState = createFilterState({ priority: "A" });

			const result = createPreset(presets, "New Preset", filterState);

			expect(result.presets).toHaveLength(1);
			expect(result.presets[0]?.name).toBe("New Preset");
			expect(result.presets[0]?.filterState.priority).toBe("A");
			expect(result.presets[0]?.id).toBeDefined();
			expect(result.createdId).toBe(result.presets[0]?.id);
		});

		it("should add to existing presets", () => {
			const existingPreset: FilterPreset = {
				id: "existing-1",
				name: "Existing",
				filterState: createFilterState(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
			const presets: FilterPreset[] = [existingPreset];

			const result = createPreset(presets, "New Preset", createFilterState({ search: "test" }));

			expect(result.presets).toHaveLength(2);
			expect(result.presets[0]?.id).toBe("existing-1");
			expect(result.presets[1]?.name).toBe("New Preset");
		});

		it("should not mutate original presets array", () => {
			const presets: FilterPreset[] = [];

			createPreset(presets, "Test", createFilterState());

			expect(presets).toHaveLength(0);
		});

		it("should generate unique ids for multiple presets", () => {
			const presets: FilterPreset[] = [];

			const result1 = createPreset(presets, "Preset 1", createFilterState());
			const result2 = createPreset(result1.presets, "Preset 2", createFilterState());

			expect(result2.presets[0]?.id).not.toBe(result2.presets[1]?.id);
		});

		it("should set createdAt and updatedAt to current timestamp", () => {
			const before = Date.now();
			const result = createPreset([], "Test", createFilterState());
			const after = Date.now();

			const preset = result.presets[0]!;
			expect(preset.createdAt).toBeGreaterThanOrEqual(before);
			expect(preset.createdAt).toBeLessThanOrEqual(after);
			expect(preset.updatedAt).toBe(preset.createdAt);
		});
	});

	describe("updatePreset", () => {
		it("should update preset name", () => {
			const preset: FilterPreset = {
				id: "preset-1",
				name: "Old Name",
				filterState: createFilterState(),
				createdAt: 1000,
				updatedAt: 1000,
			};
			const presets = [preset];

			const result = updatePreset(presets, "preset-1", { name: "New Name" });

			expect(result.presets[0]?.name).toBe("New Name");
		});

		it("should update preset filterState", () => {
			const preset: FilterPreset = {
				id: "preset-1",
				name: "Test",
				filterState: createFilterState({ priority: "all" }),
				createdAt: 1000,
				updatedAt: 1000,
			};
			const presets = [preset];
			const newFilterState = createFilterState({ priority: "A", search: "updated" });

			const result = updatePreset(presets, "preset-1", { filterState: newFilterState });

			expect(result.presets[0]?.filterState.priority).toBe("A");
			expect(result.presets[0]?.filterState.search).toBe("updated");
		});

		it("should update updatedAt timestamp", () => {
			const preset: FilterPreset = {
				id: "preset-1",
				name: "Test",
				filterState: createFilterState(),
				createdAt: 1000,
				updatedAt: 1000,
			};
			const presets = [preset];

			const before = Date.now();
			const result = updatePreset(presets, "preset-1", { name: "Updated" });
			const after = Date.now();

			expect(result.presets[0]?.updatedAt).toBeGreaterThanOrEqual(before);
			expect(result.presets[0]?.updatedAt).toBeLessThanOrEqual(after);
			expect(result.presets[0]?.createdAt).toBe(1000); // createdAt should not change
		});

		it("should not mutate original presets array", () => {
			const preset: FilterPreset = {
				id: "preset-1",
				name: "Original",
				filterState: createFilterState(),
				createdAt: 1000,
				updatedAt: 1000,
			};
			const presets = [preset];

			updatePreset(presets, "preset-1", { name: "Changed" });

			expect(presets[0]?.name).toBe("Original");
		});

		it("should return success: false when preset not found", () => {
			const result = updatePreset([], "nonexistent", { name: "Test" });

			expect(result.success).toBe(false);
			expect(result.presets).toHaveLength(0);
		});
	});

	describe("deletePreset", () => {
		it("should delete preset by id", () => {
			const presets: FilterPreset[] = [
				{
					id: "preset-1",
					name: "First",
					filterState: createFilterState(),
					createdAt: 1000,
					updatedAt: 1000,
				},
				{
					id: "preset-2",
					name: "Second",
					filterState: createFilterState(),
					createdAt: 1000,
					updatedAt: 1000,
				},
			];

			const result = deletePreset(presets, "preset-1");

			expect(result.presets).toHaveLength(1);
			expect(result.presets[0]?.id).toBe("preset-2");
			expect(result.success).toBe(true);
		});

		it("should not mutate original presets array", () => {
			const presets: FilterPreset[] = [
				{
					id: "preset-1",
					name: "Test",
					filterState: createFilterState(),
					createdAt: 1000,
					updatedAt: 1000,
				},
			];

			deletePreset(presets, "preset-1");

			expect(presets).toHaveLength(1);
		});

		it("should return success: false when preset not found", () => {
			const result = deletePreset([], "nonexistent");

			expect(result.success).toBe(false);
		});
	});

	describe("getPresetById", () => {
		it("should return preset by id", () => {
			const presets: FilterPreset[] = [
				{
					id: "preset-1",
					name: "First",
					filterState: createFilterState({ priority: "A" }),
					createdAt: 1000,
					updatedAt: 1000,
				},
				{
					id: "preset-2",
					name: "Second",
					filterState: createFilterState({ priority: "B" }),
					createdAt: 1000,
					updatedAt: 1000,
				},
			];

			const result = getPresetById(presets, "preset-2");

			expect(result?.name).toBe("Second");
			expect(result?.filterState.priority).toBe("B");
		});

		it("should return undefined when preset not found", () => {
			const result = getPresetById([], "nonexistent");

			expect(result).toBeUndefined();
		});
	});
});
