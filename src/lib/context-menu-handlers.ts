/**
 * context-menu-handlers - コンテキストメニューハンドラー
 * Sprint 63 - PBI-061: AC2対応（基本アクション）
 */

import { parseTodoTxt, appendTaskToFile } from "./parser";
import { duplicateTask } from "./todo";

/**
 * 編集アクションハンドラー
 * @param index タスクのインデックス
 * @param onEdit 編集コールバック
 */
export function handleEdit(index: number, onEdit: (index: number) => void): void {
	onEdit(index);
}

/**
 * 削除アクションハンドラー
 * @param index タスクのインデックス
 * @param onDelete 削除コールバック
 */
export async function handleDelete(
	index: number,
	onDelete: (index: number) => Promise<void>,
): Promise<void> {
	await onDelete(index);
}

/**
 * 複製アクションハンドラー
 * @param content 現在のファイル内容
 * @param index 複製するタスクのインデックス
 * @returns 更新されたファイル内容
 */
export function handleDuplicate(content: string, index: number): string {
	const todos = parseTodoTxt(content);
	
	if (index < 0 || index >= todos.length) {
		return content;
	}
	
	const originalTodo = todos[index];
	if (!originalTodo) {
		return content;
	}
	
	const duplicated = duplicateTask(originalTodo);
	return appendTaskToFile(content, duplicated);
}
