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

	// Parse dates (YYYY-MM-DD format)
	let completionDate: string | undefined;
	let creationDate: string | undefined;
	const dateRegex = /^(\d{4}-\d{2}-\d{2})\s/;

	// First date
	const firstDateMatch = remaining.match(dateRegex);
	if (firstDateMatch) {
		remaining = remaining.slice(firstDateMatch[0].length);

		// Second date (only for completed tasks)
		const secondDateMatch = remaining.match(dateRegex);
		if (secondDateMatch) {
			completionDate = firstDateMatch[1];
			creationDate = secondDateMatch[1];
			remaining = remaining.slice(secondDateMatch[0].length);
		} else {
			creationDate = firstDateMatch[1];
		}
	}

	return {
		completed,
		priority,
		completionDate,
		creationDate,
		description: trimmed,
		projects: [],
		contexts: [],
		tags: {},
		raw: line,
	};
}
