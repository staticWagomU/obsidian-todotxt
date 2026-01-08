/**
 * Grouping functions for todo.txt tasks
 */

import type { Todo } from "./todo";

/**
 * Add a todo to a group in the grouped map
 * Creates new group if it doesn't exist
 */
function addToGroup(grouped: Map<string, Todo[]>, key: string, todo: Todo): void {
	const group = grouped.get(key);
	if (group === undefined) {
		grouped.set(key, [todo]);
	} else {
		group.push(todo);
	}
}

/**
 * Group todos by project tags (+project)
 *
 * @param todos - Array of todos to group
 * @returns Map where keys are project names and values are arrays of todos containing that project
 * @remarks
 * - Empty input returns empty Map
 * - Todos without projects will be included in "未分類" group
 * - Todos with multiple projects will appear in all corresponding groups
 * - Order within each group is preserved from input array
 */
export function groupByProject(todos: Todo[]): Map<string, Todo[]> {
	const grouped = new Map<string, Todo[]>();

	for (const todo of todos) {
		if (todo.projects.length === 0) {
			// Todos without projects go to "未分類" group
			addToGroup(grouped, "未分類", todo);
		} else {
			for (const project of todo.projects) {
				addToGroup(grouped, project, todo);
			}
		}
	}

	return grouped;
}
