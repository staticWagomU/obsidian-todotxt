/**
 * Todo.txt data model
 */

import { appendTaskToFile, parseTodoTxt, updateTaskAtLine, deleteTaskAtLine } from "./parser";

export interface Todo {
	completed: boolean;
	priority?: string; // (A)-(Z)
	completionDate?: string; // YYYY-MM-DD
	creationDate?: string; // YYYY-MM-DD
	description: string;
	projects: string[]; // +project
	contexts: string[]; // @context
	tags: Record<string, string>; // key:value (due:, t:, rec:, pri:)
	raw: string; // 元の行
}

/**
 * Toggle completion status of a todo
 * When marking as complete, sets completionDate to today
 * When marking as incomplete, removes completionDate
 */
export function toggleCompletion(todo: Todo): Todo {
	const today = new Date().toISOString().split("T")[0];

	if (todo.completed) {
		// 完了→未完了
		return {
			...todo,
			completed: false,
			completionDate: undefined,
		};
	} else {
		// 未完了→完了
		return {
			...todo,
			completed: true,
			completionDate: today,
		};
	}
}

/**
 * Create a new task with description and optional priority
 * Automatically sets creationDate to today
 * Extracts projects and contexts from the description
 */
export function createTask(description: string, priority?: string): Todo {
	const today = new Date().toISOString().split("T")[0];

	// Extract projects (+project)
	const projects: string[] = [];
	const projectMatches = description.matchAll(/\+(\S+)/g);
	for (const match of projectMatches) {
		if (match[1]) {
			projects.push(match[1]);
		}
	}

	// Extract contexts (@context)
	const contexts: string[] = [];
	const contextMatches = description.matchAll(/@(\S+)/g);
	for (const match of contextMatches) {
		if (match[1]) {
			contexts.push(match[1]);
		}
	}

	return {
		completed: false,
		priority,
		creationDate: today,
		description,
		projects,
		contexts,
		tags: {},
		raw: "",
	};
}

/**
 * Create a new task and append it to the file content
 * Combines createTask and appendTaskToFile
 */
export function createAndAppendTask(content: string, description: string, priority?: string): string {
	const newTask = createTask(description, priority);
	return appendTaskToFile(content, newTask);
}

/**
 * Edit task properties with partial updates
 * Preserves metadata (completed, creationDate, completionDate, tags, raw)
 */
export function editTask(todo: Todo, updates: Partial<Pick<Todo, "description" | "priority">>): Todo {
	const result: Todo = { ...todo };

	// Handle description update (including empty string)
	if ("description" in updates) {
		const newDescription = updates.description ?? "";
		result.description = newDescription;

		// Extract projects from new description
		const projects: string[] = [];
		const projectMatches = newDescription.matchAll(/\+(\S+)/g);
		for (const match of projectMatches) {
			if (match[1]) {
				projects.push(match[1]);
			}
		}
		result.projects = projects;

		// Extract contexts from new description
		const contexts: string[] = [];
		const contextMatches = newDescription.matchAll(/@(\S+)/g);
		for (const match of contextMatches) {
			if (match[1]) {
				contexts.push(match[1]);
			}
		}
		result.contexts = contexts;
	}

	// Handle priority update (including undefined to remove priority)
	if ("priority" in updates) {
		result.priority = updates.priority;
	}

	return result;
}

/**
 * Edit and update task at specific line index
 * Combines editTask and updateTaskAtLine
 */
export function editAndUpdateTask(
	content: string,
	lineIndex: number,
	updates: Partial<Pick<Todo, "description" | "priority">>,
): string {
	const todos = parseTodoTxt(content);

	if (lineIndex < 0 || lineIndex >= todos.length) {
		return content;
	}

	const todo = todos[lineIndex];
	if (!todo) {
		return content;
	}

	const editedTodo = editTask(todo, updates);
	return updateTaskAtLine(content, lineIndex, editedTodo);
}

/**
 * Remove a task from the list at specified index
 * Returns a new array without the task
 */
export function removeTaskFromList(todos: Todo[], index: number): Todo[] {
	if (index < 0 || index >= todos.length) {
		return todos;
	}

	return todos.filter((_todo, i) => i !== index);
}

/**
 * Delete and remove task at specific line index
 * Combines deleteTaskAtLine (parser) for integrated deletion
 */
export function deleteAndRemoveTask(content: string, lineIndex: number): string {
	return deleteTaskAtLine(content, lineIndex);
}
