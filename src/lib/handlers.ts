import { parseTodoTxt, updateTodoInList } from "./parser";
import { toggleCompletion, createAndAppendTask, editAndUpdateTask, deleteAndRemoveTask, type TaskUpdates } from "./todo";

/**
 * Get toggle handler for task completion status
 */
export function getToggleHandler(
	getData: () => string,
	setViewData: (data: string, clear: boolean) => void,
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

		const result = toggleCompletion(todo);
		let updatedData = updateTodoInList(todos, index, result.originalTask);

		// If recurring task was created, append it
		if (result.recurringTask) {
			const updatedTodos = parseTodoTxt(updatedData);
			updatedTodos.push(result.recurringTask);
			updatedData = updatedTodos.map(t => t.raw).join('\n');
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
