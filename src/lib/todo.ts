/**
 * Todo.txt data model
 */

import { appendTaskToFile } from "./parser";

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
