/**
 * Todo.txt data model
 */

import { appendTaskToFile, parseTodoTxt, updateTaskAtLine, deleteTaskAtLine } from "./parser";
import { createRecurringTask } from "./recurrence";

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
 * If rec: tag exists on completion, creates a recurring task
 */
export function toggleCompletion(todo: Todo): { originalTask: Todo; recurringTask?: Todo } {
	const today = new Date().toISOString().split("T")[0]!;

	if (todo.completed) {
		// 完了→未完了
		const incompletedTask: Todo = {
			...todo,
			completed: false,
			completionDate: undefined,
		};

		// pri:タグ → priority復元
		if (todo.tags.pri) {
			incompletedTask.priority = todo.tags.pri;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { pri: _pri, ...restTags } = incompletedTask.tags;
			incompletedTask.tags = restTags;
		}

		return {
			originalTask: incompletedTask,
		};
	} else {
		// 未完了→完了
		const completedTask: Todo = {
			...todo,
			completed: true,
			completionDate: today,
		};

		// priority → pri:タグ保存
		if (todo.priority) {
			completedTask.tags = { ...completedTask.tags, pri: todo.priority };
			completedTask.priority = undefined;
		}

		// Check for rec: tag and create recurring task
		const recurringTask = createRecurringTask(completedTask, today);

		return {
			originalTask: completedTask,
			recurringTask: recurringTask ?? undefined,
		};
	}
}

/**
 * Create a new task with description and optional priority
 * Automatically sets creationDate to today
 * Extracts projects and contexts from the description
 */
export function createTask(
	description: string,
	priority?: string,
	dueDate?: string,
	thresholdDate?: string,
): Todo {
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

	// Build tags object with due: and t: if provided
	const tags: Record<string, string> = {};
	let enhancedDescription = description;
	if (dueDate) {
		tags.due = dueDate;
		enhancedDescription += ` due:${dueDate}`;
	}
	if (thresholdDate) {
		tags.t = thresholdDate;
		enhancedDescription += ` t:${thresholdDate}`;
	}

	return {
		completed: false,
		priority,
		creationDate: today,
		description: enhancedDescription,
		projects,
		contexts,
		tags,
		raw: "",
	};
}

/**
 * Create a new task and append it to the file content
 * Combines createTask and appendTaskToFile
 */
export function createAndAppendTask(
	content: string,
	description: string,
	priority?: string,
	dueDate?: string,
	thresholdDate?: string,
): string {
	const newTask = createTask(description, priority, dueDate, thresholdDate);
	return appendTaskToFile(content, newTask);
}

/**
 * Edit task properties with partial updates
 * Preserves metadata (completed, creationDate, completionDate, tags, raw)
 */
export function editTask(
	todo: Todo,
	updates: Partial<Pick<Todo, "description" | "priority" | "dueDate" | "thresholdDate">>,
): Todo {
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

	// Handle dueDate update (update or remove due: tag)
	if ("dueDate" in updates) {
		const newTags = { ...result.tags };
		// Remove existing due: from description
		result.description = result.description.replace(/\s*due:\S+/g, "");

		if (updates.dueDate) {
			newTags.due = updates.dueDate;
			result.description += ` due:${updates.dueDate}`;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { due: _due, ...restTags } = newTags;
			result.tags = restTags;
			return result;
		}
		result.tags = newTags;
	}

	// Handle thresholdDate update (update or remove t: tag)
	if ("thresholdDate" in updates) {
		const newTags = { ...result.tags };
		// Remove existing t: from description
		result.description = result.description.replace(/\s*t:\S+/g, "");

		if (updates.thresholdDate) {
			newTags.t = updates.thresholdDate;
			result.description += ` t:${updates.thresholdDate}`;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { t: _t, ...restTags } = newTags;
			result.tags = restTags;
			return result;
		}
		result.tags = newTags;
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
	updates: Partial<Pick<Todo, "description" | "priority" | "dueDate" | "thresholdDate">>,
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
