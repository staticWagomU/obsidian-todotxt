import type { Todo } from "./todo";

/**
 * Filter todos by priority
 * Returns only tasks that match the specified priority
 */
export function filterByPriority(todos: Todo[], priority: string): Todo[] {
	return todos.filter(todo => todo.priority === priority);
}
