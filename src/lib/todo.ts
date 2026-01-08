/**
 * Todo.txt data model
 */

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
