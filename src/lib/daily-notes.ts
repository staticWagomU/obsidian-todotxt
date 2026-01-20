/**
 * Daily Notes Integration
 * Functions for integrating with Obsidian's Daily Notes plugin
 */

import type { App } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";
import type { Todo } from "./todo";
import type { DailyNoteInsertPosition } from "../settings";

/**
 * Check if Daily Notes plugin is enabled
 * Wraps appHasDailyNotesPluginLoaded from obsidian-daily-notes-interface
 * @param app - Obsidian App instance
 * @returns true if Daily Notes plugin is loaded
 */
export function isDailyNotesPluginEnabled(app: App): boolean {
	return appHasDailyNotesPluginLoaded(app);
}

/**
 * Format tasks for insertion into a daily note
 * Converts todo.txt tasks to Markdown checkbox format
 * @param todos - Array of tasks to format
 * @param prefix - Prefix for each line (e.g., "- [ ] ")
 * @returns Formatted string ready for insertion
 */
export function formatTasksForDailyNote(todos: Todo[], prefix: string): string {
	// Filter out completed tasks
	const activeTodos = todos.filter((todo) => !todo.completed);

	if (activeTodos.length === 0) {
		return "";
	}

	return activeTodos
		.map((todo) => {
			// Build the task text
			let text = prefix;

			// Add priority if present
			if (todo.priority) {
				text += `(${todo.priority}) `;
			}

			// Add description (includes projects, contexts, and tags)
			text += todo.description;

			return text;
		})
		.join("\n");
}

/**
 * Insert content at the specified position in existing content
 * @param existingContent - The current file content
 * @param newContent - The content to insert
 * @param position - Where to insert ('top', 'bottom', 'cursor')
 * @param cursorOffset - Cursor position for 'cursor' mode (optional)
 * @returns The modified content
 */
export function insertContentAtPosition(
	existingContent: string,
	newContent: string,
	position: DailyNoteInsertPosition,
	cursorOffset?: number,
): string {
	// Handle empty new content
	if (!newContent) {
		return existingContent;
	}

	// Handle empty existing content
	if (!existingContent) {
		return newContent;
	}

	switch (position) {
		case "top":
			return `${newContent}\n\n${existingContent}`;

		case "bottom": {
			// Remove trailing whitespace/newlines before appending
			const trimmedExisting = existingContent.trimEnd();
			if (!trimmedExisting) {
				return `${existingContent}\n\n${newContent}`;
			}
			return `${trimmedExisting}\n\n${newContent}`;
		}

		case "cursor": {
			// If no cursor offset provided, behave like bottom
			if (cursorOffset === undefined) {
				const trimmedExisting = existingContent.trimEnd();
				if (!trimmedExisting) {
					return `${existingContent}\n\n${newContent}`;
				}
				return `${trimmedExisting}\n\n${newContent}`;
			}

			// Insert at cursor position
			const before = existingContent.slice(0, cursorOffset);
			const after = existingContent.slice(cursorOffset);

			// Add newline separators appropriately
			if (cursorOffset === 0) {
				return `${newContent}\n${after}`;
			}

			return `${before}${newContent}\n${after}`;
		}

		default:
			return existingContent;
	}
}
