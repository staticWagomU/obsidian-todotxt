import type { Todo } from "./todo";

/**
 * Parse a single line of todo.txt format
 */
export function parseTodoLine(line: string): Todo {
	const trimmed = line.trim();

	// Parse completion mark
	const completed = trimmed.startsWith("x ");

	return {
		completed,
		description: trimmed,
		projects: [],
		contexts: [],
		tags: {},
		raw: line,
	};
}
