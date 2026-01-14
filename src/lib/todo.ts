/**
 * Todo.txt data model and operations
 *
 * Re-exports the Todo type from @wagomu/todotxt-parser and provides
 * additional operations specific to this Obsidian plugin.
 */

import {
	appendTaskToFile,
	parseTodoTxt,
	updateTaskAtLine,
	deleteTaskAtLine,
	type Todo,
} from "@wagomu/todotxt-parser";
import { createRecurringTask } from "./recurrence";

// Re-export Todo type from the parser package
export type { Todo } from "@wagomu/todotxt-parser";

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
	const today = new Date().toISOString().split("T")[0]!;

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
	// t: タグ（開始日/しきい値日）: 指定がなければ本日の日付を自動設定
	const effectiveThresholdDate = thresholdDate ?? today;
	tags.t = effectiveThresholdDate;
	enhancedDescription += ` t:${effectiveThresholdDate}`;

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
 * Update tag in description and tags object
 * @param description Current description
 * @param tags Current tags object
 * @param tagName Tag name (e.g., "due", "t")
 * @param value Tag value or undefined to remove
 * @returns Updated {description, tags}
 */
function updateTagInTodo(
	description: string,
	tags: Record<string, string>,
	tagName: string,
	value: string | undefined,
): { description: string; tags: Record<string, string> } {
	// Remove existing tag from description
	const cleanedDescription = description.replace(
		new RegExp(`\\s*${tagName}:\\S+`, "g"),
		"",
	);

	if (value) {
		// Add new tag value
		return {
			description: `${cleanedDescription} ${tagName}:${value}`,
			tags: { ...tags, [tagName]: value },
		};
	}
	// Remove tag
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { [tagName]: _removed, ...restTags } = tags;
	return {
		description: cleanedDescription,
		tags: restTags,
	};
}

/**
 * Updates for editing tasks (including date fields)
 */
export interface TaskUpdates {
	description?: string;
	priority?: string;
	dueDate?: string;
	thresholdDate?: string;
}

/**
 * Edit task properties with partial updates
 * Preserves metadata (completed, creationDate, completionDate, tags, raw)
 */
export function editTask(
	todo: Todo,
	updates: TaskUpdates,
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
		const updated = updateTagInTodo(
			result.description,
			result.tags,
			"due",
			updates.dueDate,
		);
		result.description = updated.description;
		result.tags = updated.tags;
	}

	// Handle thresholdDate update (update or remove t: tag)
	if ("thresholdDate" in updates) {
		const updated = updateTagInTodo(
			result.description,
			result.tags,
			"t",
			updates.thresholdDate,
		);
		result.description = updated.description;
		result.tags = updated.tags;
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
	updates: TaskUpdates,
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
