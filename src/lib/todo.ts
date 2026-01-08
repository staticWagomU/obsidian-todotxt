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
