/**
 * Suggestions logic
 * Extract projects and contexts from existing tasks for autocomplete
 */

import type { Todo } from "./todo";

/**
 * Extract unique projects from todos
 * Returns sorted array of project names
 */
export function extractProjects(todos: Todo[]): string[] {
	const projectSet = new Set<string>();

	for (const todo of todos) {
		for (const project of todo.projects) {
			projectSet.add(project);
		}
	}

	return Array.from(projectSet).sort();
}

/**
 * Extract unique contexts from todos
 * Returns sorted array of context names
 */
export function extractContexts(todos: Todo[]): string[] {
	const contextSet = new Set<string>();

	for (const todo of todos) {
		for (const context of todo.contexts) {
			contextSet.add(context);
		}
	}

	return Array.from(contextSet).sort();
}
