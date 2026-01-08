import type { Todo } from "./todo";

/**
 * Filter todos by priority
 * Returns only tasks that match the specified priority
 * @param todos - Array of todos to filter
 * @param priority - Priority value to filter by (A-Z, null, or undefined for no priority)
 * @returns Filtered array of todos matching the priority
 */
export function filterByPriority(todos: Todo[], priority: string | null | undefined): Todo[] {
	// Handle null/undefined priority - treat them as equivalent
	if (priority === null || priority === undefined) {
		return todos.filter(todo => todo.priority === null || todo.priority === undefined);
	}
	return todos.filter(todo => todo.priority === priority);
}
