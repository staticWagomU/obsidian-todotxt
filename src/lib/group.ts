/**
 * Grouping functions for todo.txt tasks
 */

import type { Todo } from "./todo";

/**
 * Add a todo to a group in the grouped map
 * Creates new group if it doesn't exist
 *
 * @param grouped - The map to add the todo to
 * @param key - The group key (project or context name)
 * @param todo - The todo to add
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
 * Generic grouping function for todos by tags
 *
 * @param todos - Array of todos to group
 * @param getTagsFromTodo - Function to extract tag array from a todo
 * @returns Map where keys are tag names and values are arrays of todos containing that tag
 */
function groupByTags(todos: Todo[], getTagsFromTodo: (todo: Todo) => string[]): Map<string, Todo[]> {
	const grouped = new Map<string, Todo[]>();

	for (const todo of todos) {
		const tags = getTagsFromTodo(todo);
		if (tags.length === 0) {
			addToGroup(grouped, "未分類", todo);
		} else {
			for (const tag of tags) {
				addToGroup(grouped, tag, todo);
			}
		}
	}

	return grouped;
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
	return groupByTags(todos, (todo) => todo.projects);
}

/**
 * Group todos by context tags (@context)
 *
 * @param todos - Array of todos to group
 * @returns Map where keys are context names and values are arrays of todos containing that context
 * @remarks
 * - Empty input returns empty Map
 * - Todos without contexts will be included in "未分類" group
 * - Todos with multiple contexts will appear in all corresponding groups
 * - Order within each group is preserved from input array
 */
export function groupByContext(todos: Todo[]): Map<string, Todo[]> {
	return groupByTags(todos, (todo) => todo.contexts);
}
