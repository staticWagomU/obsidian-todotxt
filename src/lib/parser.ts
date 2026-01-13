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
 * Update a specific todo in the list and return the updated text
 */
export function updateTodoInList(todos: Todo[], index: number, updatedTodo: Todo): string {
	if (todos.length === 0) {
		return "";
	}

	if (index < 0 || index >= todos.length) {
		// Return original text if index is out of bounds
		return todos.map(serializeTodo).join("\n");
	}

	// Update the todo at the specified index
	const updatedTodos = [...todos];
	updatedTodos[index] = updatedTodo;

	return updatedTodos.map(serializeTodo).join("\n");
}

/**
 * Serialize a Todo object to todo.txt format string
 */
export function serializeTodo(todo: Todo): string {
	let result = "";

	// Completion mark
	if (todo.completed) {
		result += "x ";
	}

	// Priority
	if (todo.priority) {
		result += `(${todo.priority}) `;
	}

	// Completion date (only for completed tasks)
	if (todo.completed && todo.completionDate) {
		result += `${todo.completionDate} `;
	}

	// Creation date
	if (todo.creationDate) {
		result += `${todo.creationDate} `;
	}

	// Description (already contains projects, contexts, and tags)
	result += todo.description;

	return result;
}

/**
 * Append a new task to the end of the file content
 */
export function appendTaskToFile(content: string, newTask: Todo): string {
	const serializedTask = serializeTodo(newTask);

	if (content.length === 0) {
		return serializedTask;
	}

	return `${content}\n${serializedTask}`;
}

/**
 * Update a task at a specific line index in the content
 */
export function updateTaskAtLine(content: string, lineIndex: number, updatedTodo: Todo): string {
	if (content.length === 0) {
		return "";
	}

	const todos = parseTodoTxt(content);

	if (lineIndex < 0 || lineIndex >= todos.length) {
		return content;
	}

	return updateTodoInList(todos, lineIndex, updatedTodo);
}

/**
 * Delete a task at a specific line index in the content
 */
export function deleteTaskAtLine(content: string, lineIndex: number): string {
	if (content.length === 0) {
		return "";
	}

	const todos = parseTodoTxt(content);

	if (lineIndex < 0 || lineIndex >= todos.length) {
		return content;
	}

	// Remove the task at the specified index
	const updatedTodos = todos.filter((_todo, index) => index !== lineIndex);

	// Return empty string if all tasks are deleted
	if (updatedTodos.length === 0) {
		return "";
	}

	return updatedTodos.map(serializeTodo).join("\n");
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

		// Second date
		const secondDateMatch = remaining.match(dateRegex);
		if (secondDateMatch) {
			// Two dates: first is completion date (for completed tasks), second is creation date
			completionDate = firstDateMatch[1];
			creationDate = secondDateMatch[1];
			remaining = remaining.slice(secondDateMatch[0].length);
		} else {
			// One date: it's completion date if completed, creation date otherwise
			if (completed) {
				completionDate = firstDateMatch[1];
			} else {
				creationDate = firstDateMatch[1];
			}
		}
	}

	// Parse projects and contexts from the entire line
	const projects: string[] = [];
	const contexts: string[] = [];

	// +project (+ followed by non-whitespace, with space or start-of-line before)
	const projectMatches = trimmed.matchAll(/(?:^|\s)\+(\S+)/g);
	for (const match of projectMatches) {
		if (match[1]) {
			projects.push(match[1]);
		}
	}

	// @context (@ followed by non-whitespace, with space or start-of-line before)
	const contextMatches = trimmed.matchAll(/(?:^|\s)@(\S+)/g);
	for (const match of contextMatches) {
		if (match[1]) {
			contexts.push(match[1]);
		}
	}

	// Parse tags (key:value format)
	const tags: Record<string, string> = {};
	const tagMatches = trimmed.matchAll(/(\S+?):(\S+)/g);
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
		description: remaining, // Use remaining (parsed description) instead of trimmed
		projects,
		contexts,
		tags,
		raw: line,
	};
}
