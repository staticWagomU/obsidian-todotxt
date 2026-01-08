/**
 * Grouping functions for todo.txt tasks
 */

import type { Todo } from "./todo";

/**
 * Group todos by project tags (+project)
 *
 * @param todos - Array of todos to group
 * @returns Map where keys are project names and values are arrays of todos containing that project
 * @remarks
 * - Empty input returns empty Map
 * - Todos without projects will be included in "未分類" group (to be implemented)
 * - Todos with multiple projects will appear in all corresponding groups (to be implemented)
 * - Order within each group is preserved from input array
 */
export function groupByProject(todos: Todo[]): Map<string, Todo[]> {
	const grouped = new Map<string, Todo[]>();

	for (const todo of todos) {
		for (const project of todo.projects) {
			const group = grouped.get(project);
			if (group === undefined) {
				grouped.set(project, [todo]);
			} else {
				group.push(todo);
			}
		}
	}

	return grouped;
}
