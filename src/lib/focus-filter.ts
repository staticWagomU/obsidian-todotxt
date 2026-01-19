/**
 * Focus Filter - フォーカスビュー用のタスクフィルタリング機能
 * 今日やるべきタスク（due:today以前またはt:today以前）を抽出
 */

import type { Todo } from "./todo";
import { getDueDateFromTodo, getDueDateStatus } from "./due";
import { getThresholdDateStatus } from "./threshold";

/**
 * フォーカスビューに表示するタスクをフィルタリング
 * @param todos タスク配列
 * @param today 今日の日付
 * @returns フォーカス対象のタスク配列
 */
export function filterFocusTodos(todos: Todo[], today: Date): Todo[] {
	return todos.filter((todo) => {
		// 完了済みタスクは除外（AC4）
		if (todo.completed) {
			return false;
		}

		// due:が今日以前かチェック（AC1）
		const dueDate = getDueDateFromTodo(todo);
		if (dueDate) {
			const status = getDueDateStatus(dueDate, today);
			if (status === "today" || status === "overdue") {
				return true;
			}
		}

		// t:が今日以前かチェック（AC2: ready = 今日または過去）
		const thresholdStatus = getThresholdDateStatus(todo, today);
		if (thresholdStatus === "ready") {
			return true;
		}

		// due:もt:もないタスクは除外（AC3）
		return false;
	});
}

/**
 * フォーカスビュー用のタスクソート（AC5）
 * 優先度順（A>B>...>Z>なし）、同優先度内は説明文順
 * @param todos タスク配列
 * @returns ソート済みタスク配列（元の配列は変更しない）
 */
export function sortFocusTodos(todos: Todo[]): Todo[] {
	if (todos.length === 0) {
		return [];
	}

	// 元の配列を変更しないようにコピーしてソート
	return [...todos].sort((a, b) => {
		// Priority comparison: A < B < C < ... < Z < undefined
		if (a.priority && b.priority) {
			// Both have priority: compare alphabetically
			if (a.priority < b.priority) return -1;
			if (a.priority > b.priority) return 1;
			// Same priority: compare by description
			return a.description.localeCompare(b.description);
		} else if (a.priority && !b.priority) {
			// a has priority, b doesn't: a comes first
			return -1;
		} else if (!a.priority && b.priority) {
			// b has priority, a doesn't: b comes first
			return 1;
		} else {
			// Neither has priority: compare by description
			return a.description.localeCompare(b.description);
		}
	});
}
