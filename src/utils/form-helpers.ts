/**
 * Form Helper Utilities
 * フォーム関連の共通ユーティリティ関数
 */

/**
 * フォーム入力値からtodo.txt形式のdescriptionを構築
 * @param description 基本のタスク説明
 * @param dueDate 期限日 (due:タグ)
 * @param thresholdDate 開始日 (t:タグ)
 * @returns todo.txt形式のdescription
 */
export function buildDescriptionWithTags(
	description: string,
	dueDate?: string,
	thresholdDate?: string,
): string {
	let result = description;
	
	if (dueDate) {
		result += ` due:${dueDate}`;
	}
	if (thresholdDate) {
		result += ` t:${thresholdDate}`;
	}
	
	return result;
}
