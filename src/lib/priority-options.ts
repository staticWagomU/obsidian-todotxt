/**
 * Priority options logic
 * Generates priority dropdown options (A-Z + none) and validates priority values
 */

export interface PriorityOption {
	label: string;
	value: string | null;
}

/**
 * Generate priority options for dropdown (none + A-Z)
 * Returns an array of {label, value} objects
 */
export function generatePriorityOptions(): PriorityOption[] {
	const options: PriorityOption[] = [{ label: "なし", value: null }];

	// Generate A-Z priority options
	for (let i = 0; i < 26; i++) {
		const letter = String.fromCharCode(65 + i); // A=65, B=66, ..., Z=90
		options.push({ label: `(${letter})`, value: letter });
	}

	return options;
}

/**
 * Validate priority value (null or A-Z uppercase)
 * Returns true if the priority is valid
 */
export function isPriorityValid(priority: string | null | undefined): boolean {
	if (priority === null || priority === undefined) {
		return true;
	}

	// Must be a single uppercase letter A-Z
	return /^[A-Z]$/.test(priority);
}
