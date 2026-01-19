import type { FilterState } from "./rendering";

/**
 * FilterPreset represents a saved filter configuration
 * Allows users to save and restore filter states by name
 */
export interface FilterPreset {
	/** Unique identifier for the preset */
	id: string;
	/** User-friendly name for the preset */
	name: string;
	/** The saved filter state */
	filterState: FilterState;
	/** Timestamp when the preset was created */
	createdAt: number;
	/** Timestamp when the preset was last updated */
	updatedAt: number;
}

/**
 * Generate a unique ID for a preset
 * Uses timestamp + random string for uniqueness
 */
function generatePresetId(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 8);
	return `preset-${timestamp}-${random}`;
}

/**
 * Create a new preset and add it to the presets array
 * Returns a new array with the added preset (immutable)
 * 
 * @param presets - Existing presets array
 * @param name - Name for the new preset
 * @param filterState - Filter state to save
 * @returns Object containing new presets array and the created preset's id
 */
export function createPreset(
	presets: FilterPreset[],
	name: string,
	filterState: FilterState,
): { presets: FilterPreset[]; createdId: string } {
	const now = Date.now();
	const id = generatePresetId();
	
	const newPreset: FilterPreset = {
		id,
		name,
		filterState: { ...filterState },
		createdAt: now,
		updatedAt: now,
	};

	return {
		presets: [...presets, newPreset],
		createdId: id,
	};
}

/**
 * Update an existing preset by id
 * Returns a new array with the updated preset (immutable)
 * 
 * @param presets - Existing presets array
 * @param id - ID of the preset to update
 * @param updates - Partial updates to apply (name and/or filterState)
 * @returns Object containing new presets array and success status
 */
export function updatePreset(
	presets: FilterPreset[],
	id: string,
	updates: Partial<Pick<FilterPreset, "name" | "filterState">>,
): { presets: FilterPreset[]; success: boolean } {
	const index = presets.findIndex(preset => preset.id === id);
	
	if (index === -1) {
		return { presets: [...presets], success: false };
	}

	const now = Date.now();
	const existingPreset = presets[index]!;
	
	const updatedPreset: FilterPreset = {
		...existingPreset,
		...(updates.name !== undefined && { name: updates.name }),
		...(updates.filterState !== undefined && { filterState: { ...updates.filterState } }),
		updatedAt: now,
	};

	const newPresets = [...presets];
	newPresets[index] = updatedPreset;

	return { presets: newPresets, success: true };
}

/**
 * Delete a preset by id
 * Returns a new array without the deleted preset (immutable)
 * 
 * @param presets - Existing presets array
 * @param id - ID of the preset to delete
 * @returns Object containing new presets array and success status
 */
export function deletePreset(
	presets: FilterPreset[],
	id: string,
): { presets: FilterPreset[]; success: boolean } {
	const index = presets.findIndex(preset => preset.id === id);
	
	if (index === -1) {
		return { presets: [...presets], success: false };
	}

	return {
		presets: presets.filter(preset => preset.id !== id),
		success: true,
	};
}

/**
 * Get a preset by id
 * 
 * @param presets - Presets array to search
 * @param id - ID of the preset to find
 * @returns The preset if found, undefined otherwise
 */
export function getPresetById(
	presets: FilterPreset[],
	id: string,
): FilterPreset | undefined {
	return presets.find(preset => preset.id === id);
}
