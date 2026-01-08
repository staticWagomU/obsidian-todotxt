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

	// Sort function for priority and description
	const sortByPriorityAndDescription = (a: Todo, b: Todo): number => {
		// Priority comparison: A < B < C < ... < Z < undefined
		if (a.priority && b.priority) {
			// Both have priority: compare alphabetically
			if (a.priority < b.priority) return -1;
			if (a.priority > b.priority) return 1;
			// Same priority: compare by description
			return a.description.localeCompare(b.description);
		} else if (a.priority && !b.priority) {
			// a has priority, b doesn't: a comes first
			return -1;
		} else if (!a.priority && b.priority) {
			// b has priority, a doesn't: b comes first
			return 1;
		} else {
			// Neither has priority: compare by description
			return a.description.localeCompare(b.description);
		}
	};

	// Sort both groups (create copies to ensure immutability)
	const sortedIncompleteTasks = [...incompleteTasks].sort(sortByPriorityAndDescription);
	const sortedCompletedTasks = [...completedTasks].sort(sortByPriorityAndDescription);

	// Return incomplete tasks first, then completed tasks
	return [...sortedIncompleteTasks, ...sortedCompletedTasks];
}
