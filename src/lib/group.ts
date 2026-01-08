/**
 * Grouping functions for todo.txt tasks
 */

import type { Todo } from "./todo";

/**
 * Group todos by project tags (+project)
 * Returns a Map where keys are project names and values are arrays of todos
 */
export function groupByProject(todos: Todo[]): Map<string, Todo[]> {
	return new Map();
}
