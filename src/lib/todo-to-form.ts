/**
 * Todo to Form conversion
 * Convert Todo objects to form data for editing
 */

import type { Todo } from "./todo";
import type { TaskFormData } from "./form-validation";

/**
 * Remove projects, contexts, and tags from description
 * Returns the clean description text
 */
function cleanDescription(description: string, projects: string[], contexts: string[], tags: Record<string, string>): string {
	let cleaned = description;

	// Remove projects
	for (const project of projects) {
		cleaned = cleaned.replace(new RegExp(`\\+${project}\\b`, "g"), "");
	}

	// Remove contexts
	for (const context of contexts) {
		cleaned = cleaned.replace(new RegExp(`@${context}\\b`, "g"), "");
	}

	// Remove tags
	for (const [key, value] of Object.entries(tags)) {
		cleaned = cleaned.replace(new RegExp(`${key}:${value}\\b`, "g"), "");
	}

	return cleaned.trim().replace(/\s+/g, " ");
}

/**
 * Convert Todo to TaskFormData
 * Extracts due/threshold from tags and cleans description
 */
export function todoToFormData(todo: Todo): TaskFormData {
	// Extract due and threshold from tags
	const { due, t: threshold, ...customTags } = todo.tags;

	return {
		description: cleanDescription(todo.description, todo.projects, todo.contexts, todo.tags),
		priority: todo.priority,
		creationDate: todo.creationDate,
		due,
		threshold,
		projects: todo.projects,
		contexts: todo.contexts,
		tags: customTags,
	};
}
