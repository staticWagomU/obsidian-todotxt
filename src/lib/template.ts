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

/**
 * Parse a template string into multiple task lines
 * Splits by newlines, expands placeholders, and filters empty lines
 *
 * @param template - Multi-line template string
 * @returns Array of task lines with placeholders expanded
 */
export function parseTemplate(template: string): string[] {
	if (!template.trim()) {
		return [];
	}

	// Split by newlines (handle both LF and CRLF)
	return template
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(line => expandPlaceholders(line));
}
