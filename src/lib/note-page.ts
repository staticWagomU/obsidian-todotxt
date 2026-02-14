/**
 * Note page generation utilities for creating Obsidian pages from tasks.
 *
 * Provides functions for:
 * - Page name generation with timestamp
 * - File name sanitization
 * - Page content template generation
 * - Link presence detection in task descriptions
 */

import type { Todo } from "./todo";
import { extractInternalLinks } from "./internallink";
import { extractExternalLinks } from "./externallink";

/**
 * Format a Date as "YYYY-MM-DD HHmmss"
 */
export function formatTimestamp(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	const ss = String(date.getSeconds()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd} ${hh}${min}${ss}`;
}

/**
 * Remove file system invalid characters: /\:*?"<>|
 * Also trims leading/trailing whitespace.
 */
export function sanitizeFileName(name: string): string {
	return name.replace(/[/\\:*?"<>|]/g, "").trim();
}

/**
 * Generate a page name from a task description.
 * Format: "{sanitized description} {YYYY-MM-DD HHmmss}.md"
 *
 * @param description - The task description (already cleaned of projects/contexts by caller)
 * @param now - Optional Date for testability; defaults to current time
 */
export function generatePageName(description: string, now?: Date): string {
	const timestamp = formatTimestamp(now ?? new Date());
	const cleanName = sanitizeFileName(description);
	return `${cleanName} ${timestamp}.md`;
}

/**
 * Generate default page content from a Todo item.
 *
 * Template:
 * ```
 * ---
 * source_task: "{raw task text}"
 * created: {YYYY-MM-DD}
 * ---
 *
 * # {task description}
 * ```
 */
export function generatePageContent(todo: Todo): string {
	const created = todo.creationDate ?? new Date().toISOString().split("T")[0]!;
	return `---
source_task: "${todo.raw}"
created: ${created}
---

# ${todo.description}
`;
}

/**
 * Check whether a task's description contains any internal or external links.
 * Uses extractInternalLinks() and extractExternalLinks() from existing modules.
 */
export function hasPageLink(todo: Todo): boolean {
	const internalLinks = extractInternalLinks(todo.description);
	if (internalLinks.length > 0) return true;

	const externalLinks = extractExternalLinks(todo.description);
	return externalLinks.length > 0;
}
