/**
 * Tag utilities
 * key:value tag manipulation logic (add, remove, update, parse, serialize)
 */

/**
 * Add a tag to the tags object (immutable)
 * Returns a new object with the added tag
 */
export function addTag(tags: Record<string, string>, key: string, value: string): Record<string, string> {
	return { ...tags, [key]: value };
}

/**
 * Remove a tag from the tags object (immutable)
 * Returns a new object without the removed tag
 */
export function removeTag(tags: Record<string, string>, key: string): Record<string, string> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { [key]: _removed, ...rest } = tags;
	return rest;
}

/**
 * Update a tag value in the tags object (immutable)
 * Returns a new object with the updated tag
 */
export function updateTag(tags: Record<string, string>, key: string, value: string): Record<string, string> {
	return { ...tags, [key]: value };
}

/**
 * Parse key:value string into {key, value} object
 * Returns null if the format is invalid
 */
export function parseTagInput(input: string): { key: string; value: string } | null {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		return null;
	}

	const colonIndex = trimmed.indexOf(":");
	if (colonIndex === -1) {
		return null;
	}

	const key = trimmed.slice(0, colonIndex).trim();
	const value = trimmed.slice(colonIndex + 1).trim();

	if (key.length === 0 || value.length === 0) {
		return null;
	}

	return { key, value };
}

/**
 * Serialize tags object to "key:value key2:value2" string
 * Returns empty string if tags object is empty
 */
export function serializeTags(tags: Record<string, string>): string {
	const entries = Object.entries(tags);
	if (entries.length === 0) {
		return "";
	}

	return entries.map(([key, value]) => `${key}:${value}`).join(" ");
}
