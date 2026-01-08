import type { Todo } from "./todo";

/**
 * Parse multiple lines of todo.txt format into an array of Todo objects
 */
export function parseTodoTxt(text: string): Todo[] {
	const lines = text.split("\n");
	const todos: Todo[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.length > 0) {
			todos.push(parseTodoLine(line));
		}
	}

	return todos;
}

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

	// Parse projects and contexts from the entire line
	const projects: string[] = [];
	const contexts: string[] = [];

	// +project (+ followed by non-whitespace)
	const projectMatches = trimmed.matchAll(/\+(\S+)/g);
	for (const match of projectMatches) {
		if (match[1]) {
			projects.push(match[1]);
		}
	}

	// @context (@ followed by non-whitespace)
	const contextMatches = trimmed.matchAll(/@(\S+)/g);
	for (const match of contextMatches) {
		if (match[1]) {
			contexts.push(match[1]);
		}
	}

	// Parse tags (key:value format)
	const tags: Record<string, string> = {};
	const tagMatches = trimmed.matchAll(/(\S+):(\S+)/g);
	for (const match of tagMatches) {
		// Skip if it's a project or context (already parsed)
		if (match[1] && match[2] && !match[0].startsWith("+") && !match[0].startsWith("@")) {
			tags[match[1]] = match[2];
		}
	}

	return {
		completed,
		priority,
		completionDate,
		creationDate,
		description: trimmed,
		projects,
		contexts,
		tags,
		raw: line,
	};
}
