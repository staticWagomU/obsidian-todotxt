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

/**
 * Parse Markdown checkboxes from content and convert to Todo objects
 * Supports formats: - [ ], * [ ], 1. [ ]
 * @param content - Markdown content to parse
 * @returns Array of Todo objects
 */
export function parseMarkdownCheckboxes(content: string): Todo[] {
	if (!content) {
		return [];
	}

	const todos: Todo[] = [];

	// Regex to match markdown checkboxes
	// Supports: - [ ] task, * [ ] task, 1. [ ] task (with optional leading whitespace)
	const checkboxRegex = /^\s*(?:[-*]|\d+\.)\s*\[([ xX])\]\s*(.*)$/;

	// Split by both \n and \r\n
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		const match = checkboxRegex.exec(line);
		if (!match) {
			continue;
		}

		const checkMark = match[1];
		const taskText = match[2]?.trim() ?? "";

		// Determine completion status
		const completed = checkMark === "x" || checkMark === "X";

		// Extract projects (+word)
		const projects: string[] = [];
		const projectMatches = taskText.matchAll(/\+(\S+)/g);
		for (const projectMatch of projectMatches) {
			if (projectMatch[1]) {
				projects.push(projectMatch[1]);
			}
		}

		// Extract contexts (@word)
		const contexts: string[] = [];
		const contextMatches = taskText.matchAll(/@(\S+)/g);
		for (const contextMatch of contextMatches) {
			if (contextMatch[1]) {
				contexts.push(contextMatch[1]);
			}
		}

		// Extract tags (key:value)
		const tags: Record<string, string> = {};
		const tagMatches = taskText.matchAll(/(\w+):(\S+)/g);
		for (const tagMatch of tagMatches) {
			if (tagMatch[1] && tagMatch[2]) {
				tags[tagMatch[1]] = tagMatch[2];
			}
		}

		todos.push({
			completed,
			priority: undefined,
			creationDate: undefined,
			completionDate: undefined,
			description: taskText,
			projects,
			contexts,
			tags,
			raw: line,
		});
	}

	return todos;
}
