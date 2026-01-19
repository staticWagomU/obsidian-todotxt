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
		// due:が今日以前かチェック
		const dueDate = getDueDateFromTodo(todo);
		if (dueDate) {
			const status = getDueDateStatus(dueDate, today);
			if (status === "today" || status === "overdue") {
				return true;
			}
		}

		// t:が今日以前かチェック（ready = 今日または過去）
		const thresholdStatus = getThresholdDateStatus(todo, today);
		if (thresholdStatus === "ready") {
			return true;
		}

		return false;
	});
}
