import type { Todo } from "./todo";

/**
 * Check if a value is null or undefined
 */
function isNullOrUndefined(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Filter todos by priority (immutable)
 * Returns a new array containing only tasks that match the specified priority
 * The original array is not modified
 *
 * Edge cases handled:
 * - Empty array returns empty array
 * - No matches returns empty array
 * - Multiple matching tasks preserves original order
 * - Both completed and incomplete tasks are filtered
 *
 * @param todos - Array of todos to filter
 * @param priority - Priority value to filter by (A-Z, null, or undefined for no priority)
 * @returns New filtered array of todos matching the priority
 */
export function filterByPriority(todos: Todo[], priority: string | null | undefined): Todo[] {
	// Handle null/undefined priority - treat them as equivalent
	if (isNullOrUndefined(priority)) {
		return todos.filter(todo => isNullOrUndefined(todo.priority));
	}
	return todos.filter(todo => todo.priority === priority);
}

/**
 * Filter todos by search keyword in description, projects, or contexts (immutable)
 * Returns a new array containing only tasks that match the search keyword
 * The search is case-insensitive
 * The original array is not modified
 *
 * @param todos - Array of todos to filter
 * @param keyword - Search keyword to find in description, projects, or contexts
 * @returns New filtered array of todos matching the search keyword
 */
export function filterBySearch(todos: Todo[], keyword: string): Todo[] {
	const lowerKeyword = keyword.toLowerCase();
	return todos.filter(todo =>
		todo.description.toLowerCase().includes(lowerKeyword) ||
		todo.projects.some(project => project.toLowerCase().includes(lowerKeyword)) ||
		todo.contexts.some(context => context.toLowerCase().includes(lowerKeyword))
	);
}
