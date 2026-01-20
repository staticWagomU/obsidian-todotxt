/**
 * Daily Notes Integration
 * Functions for integrating with Obsidian's Daily Notes plugin
 */

import type { App } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";
import type { Todo } from "./todo";

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
