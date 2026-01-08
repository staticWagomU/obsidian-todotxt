import type { Todo } from "./todo";

/**
 * Filter todos by priority
 * Returns only tasks that match the specified priority
 * @param todos - Array of todos to filter
 * @param priority - Priority value to filter by (A-Z)
 * @returns Filtered array of todos matching the priority
 */
export function filterByPriority(todos: Todo[], priority: string): Todo[] {
	return todos.filter(todo => todo.priority === priority);
}
