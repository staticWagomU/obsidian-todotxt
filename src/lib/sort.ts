import type { Todo } from "./todo";

/**
 * Sort todos by completion status, priority, and description
 * Incomplete tasks come before completed tasks
 */
export function sortTodos(todos: Todo[]): Todo[] {
	if (todos.length === 0) {
		return [];
	}

	// Separate incomplete and completed tasks
	const incompleteTasks = todos.filter(todo => !todo.completed);
	const completedTasks = todos.filter(todo => todo.completed);

	// Return incomplete tasks first, then completed tasks
	return [...incompleteTasks, ...completedTasks];
}
