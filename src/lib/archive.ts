/**
 * Archive completed tasks to done.txt
 */

import type { Todo } from "./todo";
import { parseTodoTxt } from "./parser";

/**
 * Get archive file path preserving the source file's extension.
 * e.g. todo.txt → todo.done.txt, todo.md → todo.done.md
 * @param todoPath Path to source todo file
 * @returns Path to archive file
 */
export function getArchiveFilePath(todoPath: string): string {
	const extMatch = todoPath.match(/\.(txt|todotxt|md)$/);
	if (!extMatch) {
		return `${todoPath}.done.txt`;
	}
	const basePath = todoPath.slice(0, -extMatch[0].length);
	return `${basePath}.done.${extMatch[1]}`;
}

/**
 * Append completed tasks to archive file content
 * @param existingArchive Existing archive file content
 * @param completedTasks Array of completed tasks to append
 * @returns Updated archive file content
 */
export function appendToArchiveFile(existingArchive: string, completedTasks: Todo[]): string {
	const tasksToAppend = completedTasks.map((task) => task.raw).join("\n");
	
	if (!existingArchive) {
		return `${tasksToAppend}\n`;
	}
	
	// Ensure existing archive ends with newline
	const normalizedArchive = existingArchive.endsWith("\n") ? existingArchive : `${existingArchive}\n`;
	return `${normalizedArchive}${tasksToAppend}\n`;
}

/**
 * Extract completed tasks from content and return both completed tasks and remaining content
 * @param content Todo.txt file content
 * @returns Object containing completedTasks array and remainingContent string
 */
export function archiveCompletedTasks(content: string): {
	completedTasks: Todo[];
	remainingContent: string;
} {
	const todos = parseTodoTxt(content);
	const completedTasks = todos.filter((todo) => todo.completed);
	
	// Reconstruct remaining content from incomplete tasks
	const incompleteTasks = todos.filter((todo) => !todo.completed);
	const remainingContent = incompleteTasks.map((todo) => todo.raw).join("\n");
	
	return {
		completedTasks,
		remainingContent: remainingContent ? `${remainingContent}\n` : "",
	};
}
