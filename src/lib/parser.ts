import type { Todo } from "./todo";

/**
 * Parse a single line of todo.txt format
 */
export function parseTodoLine(line: string): Todo {
	const trimmed = line.trim();

	// Parse completion mark
	const completed = trimmed.startsWith("x ");

	// Parse priority
	let priority: string | undefined;
	let remaining = completed ? trimmed.slice(2).trim() : trimmed;

	const priorityMatch = remaining.match(/^\(([A-Z])\)\s/);
	if (priorityMatch) {
		priority = priorityMatch[1];
		remaining = remaining.slice(priorityMatch[0].length);
	}

	return {
		completed,
		priority,
		description: trimmed,
		projects: [],
		contexts: [],
		tags: {},
		raw: line,
	};
}
