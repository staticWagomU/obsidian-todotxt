import { parseTodoTxt, updateTodoInList, serializeTodo } from "./parser";
import { toggleCompletion, createAndAppendTask, editAndUpdateTask, deleteAndRemoveTask, type TaskUpdates, type ToggleCompletionOptions } from "./todo";
import { archiveCompletedTasks, appendToArchiveFile } from "./archive";
import { UndoRedoHistory } from "./undo-redo";

/**
 * Dependencies for auto-archiving completed tasks
 */
export interface AutoArchiveDeps {
	readArchive: () => Promise<string>;
	writeArchive: (data: string) => Promise<void>;
}

/**
 * Get toggle handler for task completion status
 */
export function getToggleHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
	autoArchiveDeps?: AutoArchiveDeps,
	completionOptions?: ToggleCompletionOptions,
): (index: number) => Promise<void> {
	return async (index: number) => {
		const data = getData();
		const todos = parseTodoTxt(data);

		if (index < 0 || index >= todos.length) {
			return;
		}

		const todo = todos[index];
		if (!todo) {
			return;
		}

		const result = toggleCompletion(todo, completionOptions);
		let updatedData = updateTodoInList(todos, index, result.originalTask);

		// If recurring task was created, append it
		if (result.recurringTask) {
			const updatedTodos = parseTodoTxt(updatedData);
			updatedTodos.push(result.recurringTask);
			updatedData = updatedTodos.map(t => t.raw).join('\n');
		}

		// Auto-archive: move completed task to done file
		if (autoArchiveDeps && result.originalTask.completed) {
			const serializedRaw = serializeTodo(result.originalTask);
			const todoForArchive = { ...result.originalTask, raw: serializedRaw };

			const existingArchive = await autoArchiveDeps.readArchive();
			const updatedArchive = appendToArchiveFile(existingArchive, [todoForArchive]);
			await autoArchiveDeps.writeArchive(updatedArchive);

			updatedData = deleteAndRemoveTask(updatedData, index);
		}

		setViewData(updatedData, false);
	};
}

/**
 * Get add handler for creating new tasks
 */
export function getAddHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
): (
	description: string,
	priority?: string,
	dueDate?: string,
	thresholdDate?: string,
) => Promise<void> {
	return async (
		description: string,
		priority?: string,
		dueDate?: string,
		thresholdDate?: string,
	) => {
		const currentData = getData();
		const updatedData = createAndAppendTask(
			currentData,
			description,
			priority,
			dueDate,
			thresholdDate,
		);

		setViewData(updatedData, false);
	};
}

/**
 * Get edit handler for editing existing tasks
 */
export function getEditHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
): (
	lineIndex: number,
	updates: TaskUpdates,
) => Promise<void> {
	return async (
		lineIndex: number,
		updates: TaskUpdates,
	) => {
		const currentData = getData();
		const updatedData = editAndUpdateTask(currentData, lineIndex, updates);

		setViewData(updatedData, false);
	};
}

/**
 * Get delete handler for deleting tasks
 */
export function getDeleteHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
): (index: number) => Promise<void> {
	return async (index: number) => {
		const currentData = getData();
		const updatedData = deleteAndRemoveTask(currentData, index);

		setViewData(updatedData, false);
	};
}

/**
 * Get archive handler for archiving completed tasks to done.txt
 */
export function getArchiveHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
	todoPath: string,
	readArchive: () => Promise<string>,
	writeArchive: (data: string) => Promise<void>,
): () => Promise<void> {
	return async () => {
		const currentData = getData();
		const { completedTasks, remainingContent } = archiveCompletedTasks(currentData);

		// Do nothing if no completed tasks
		if (completedTasks.length === 0) {
			return;
		}

		// Read existing archive, append completed tasks, and write back
		const existingArchive = await readArchive();
		const updatedArchive = appendToArchiveFile(existingArchive, completedTasks);
		await writeArchive(updatedArchive);

		// Update original file to remove completed tasks
		setViewData(remainingContent, false);
	};
}

/**
 * Get undo handler for reverting to previous state (AC1)
 * @returns Handler function that returns true if undo was successful
 */
export function getUndoHandler(
	history: UndoRedoHistory<string>,
	setViewData: (data: string, clear: boolean) => void,
): () => Promise<boolean> {
	return async () => {
		if (!history.canUndo()) {
			return false;
		}

		const previousState = history.undo();
		if (previousState === undefined) {
			return false;
		}

		setViewData(previousState, false);
		return true;
	};
}

/**
 * Get redo handler for restoring next state (AC2)
 * @returns Handler function that returns true if redo was successful
 */
export function getRedoHandler(
	history: UndoRedoHistory<string>,
	setViewData: (data: string, clear: boolean) => void,
): () => Promise<boolean> {
	return async () => {
		if (!history.canRedo()) {
			return false;
		}

		const nextState = history.redo();
		if (nextState === undefined) {
			return false;
		}

		setViewData(nextState, false);
		return true;
	};
}
