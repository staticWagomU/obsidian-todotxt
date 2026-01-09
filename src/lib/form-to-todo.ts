/**
 * Form to Todo conversion
 * Convert form data to Todo objects for task creation
 */

import type { Todo } from "./todo";
import type { TaskFormData } from "./form-validation";

/**
 * Build description string from form data
 * Appends projects, contexts, and tags to the base description
 */
function buildDescription(formData: TaskFormData): string {
	let description = formData.description;

	// Append projects
	if (formData.projects && formData.projects.length > 0) {
		const projectsStr = formData.projects.map((p) => `+${p}`).join(" ");
		description += ` ${projectsStr}`;
	}

	// Append contexts
	if (formData.contexts && formData.contexts.length > 0) {
		const contextsStr = formData.contexts.map((c) => `@${c}`).join(" ");
		description += ` ${contextsStr}`;
	}

	// Append due tag
	if (formData.due) {
		description += ` due:${formData.due}`;
	}

	// Append threshold tag
	if (formData.threshold) {
		description += ` t:${formData.threshold}`;
	}

	// Append custom tags
	if (formData.tags) {
		for (const [key, value] of Object.entries(formData.tags)) {
			description += ` ${key}:${value}`;
		}
	}

	return description.trim();
}

/**
 * Build tags object from form data
 * Includes due and threshold tags if provided
 */
function buildTags(formData: TaskFormData): Record<string, string> {
	const tags: Record<string, string> = { ...formData.tags };

	if (formData.due) {
		tags.due = formData.due;
	}

	if (formData.threshold) {
		tags.t = formData.threshold;
	}

	return tags;
}

/**
 * Convert form data to Todo object
 * Automatically sets creationDate to today if not provided
 * Appends projects, contexts, and tags to description
 */
export function formDataToTodo(formData: TaskFormData): Todo {
	const today = new Date().toISOString().split("T")[0]!;

	return {
		completed: false,
		priority: formData.priority,
		creationDate: formData.creationDate ?? today,
		description: buildDescription(formData),
		projects: formData.projects ?? [],
		contexts: formData.contexts ?? [],
		tags: buildTags(formData),
		raw: "",
	};
}
