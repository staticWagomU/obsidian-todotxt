/**
 * Template utilities for task templates
 * PBI-066: Task Template Feature
 */

import { dateToString } from "./date-utils";

/**
 * Expand placeholders in a template string
 * Supports {{today}} and {{tomorrow}} placeholders (case-insensitive)
 * 
 * @param template - Template string with placeholders
 * @returns String with placeholders expanded to actual dates
 */
export function expandPlaceholders(template: string): string {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const todayStr = dateToString(today);
	const tomorrowStr = dateToString(tomorrow);

	// Replace {{today}} (case-insensitive)
	let result = template.replace(/\{\{today\}\}/gi, todayStr);

	// Replace {{tomorrow}} (case-insensitive)
	result = result.replace(/\{\{tomorrow\}\}/gi, tomorrowStr);

	return result;
}
