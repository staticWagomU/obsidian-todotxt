/**
 * Date utilities
 * Conversion between Date objects and YYYY-MM-DD strings
 */

/**
 * Convert Date object to YYYY-MM-DD string
 * Uses local timezone
 */
export function dateToString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD string to Date object
 * Returns null if the string is invalid or date doesn't exist
 */
export function stringToDate(dateString: string): Date | null {
	// Check format with regex
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		return null;
	}

	// Parse and validate
	const [year, month, day] = dateString.split("-").map(Number);

	if (year === undefined || month === undefined || day === undefined) {
		return null;
	}

	const date = new Date(year, month - 1, day);

	// Validate that the date is valid (not adjusted by Date constructor)
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}

	return date;
}

/**
 * Check if two date strings represent the same date
 * Returns false if either is null/undefined
 */
export function isSameDateString(date1: string | null | undefined, date2: string | null | undefined): boolean {
	if (date1 === null || date1 === undefined || date2 === null || date2 === undefined) {
		return false;
	}

	return date1 === date2;
}
