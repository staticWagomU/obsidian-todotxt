/**
 * Form Helper Utilities
 * フォーム関連の共通ユーティリティ関数
 */

/**
 * フォーム入力値からtodo.txt形式のdescriptionを構築
 * 既存のdue:/t:タグがdescriptionに含まれている場合は、フォームの値で上書きする
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
	// 既存のdue:/t:タグを削除してからフォームの値を追加
	let result = description
		.replace(/\s*\bdue:\d{4}-\d{2}-\d{2}/g, "")
		.replace(/\s*\bt:\d{4}-\d{2}-\d{2}/g, "")
		.trim();

	if (dueDate) {
		result += ` due:${dueDate}`;
	}
	if (thresholdDate) {
		result += ` t:${thresholdDate}`;
	}

	return result;
}

/**
 * フォーム値からtodo.txt形式の完全なテキストを構築
 * 既存のdue:/t:タグがdescriptionに含まれている場合は、フォームの値で上書きする
 * @param description タスク説明
 * @param priority 優先度
 * @param dueDate 期限日
 * @param thresholdDate 開始日
 * @returns todo.txt形式のテキスト
 */
export function buildTextFromFormValues(
	description: string,
	priority?: string,
	dueDate?: string,
	thresholdDate?: string,
): string {
	let text = "";

	if (priority) {
		text += `(${priority}) `;
	}

	// 既存のdue:/t:タグを削除してからフォームの値を追加
	const cleanedDescription = description
		.replace(/\s*\bdue:\d{4}-\d{2}-\d{2}/g, "")
		.replace(/\s*\bt:\d{4}-\d{2}-\d{2}/g, "")
		.trim();

	text += cleanedDescription;

	if (dueDate) {
		text += ` due:${dueDate}`;
	}

	if (thresholdDate) {
		text += ` t:${thresholdDate}`;
	}

	return text;
}

/**
 * todo.txt形式のテキストからフォーム値を抽出
 * @param text todo.txt形式のテキスト
 * @returns フォーム値
 */
export function parseFormValuesFromText(text: string): {
	description: string;
	priority?: string;
	dueDate?: string;
	thresholdDate?: string;
} {
	let remaining = text.trim();
	let priority: string | undefined;
	let dueDate: string | undefined;
	let thresholdDate: string | undefined;

	// Parse priority
	const priorityMatch = remaining.match(/^\(([A-Z])\)\s/);
	if (priorityMatch) {
		priority = priorityMatch[1];
		remaining = remaining.slice(priorityMatch[0].length);
	}

	// Parse due: tag
	const dueMatch = remaining.match(/\bdue:(\d{4}-\d{2}-\d{2})/);
	if (dueMatch) {
		dueDate = dueMatch[1];
		remaining = remaining.replace(dueMatch[0], "");
	}

	// Parse t: tag
	const thresholdMatch = remaining.match(/\bt:(\d{4}-\d{2}-\d{2})/);
	if (thresholdMatch) {
		thresholdDate = thresholdMatch[1];
		remaining = remaining.replace(thresholdMatch[0], "");
	}

	// Clean up description (remove extra spaces)
	const description = remaining.trim();

	return { description, priority, dueDate, thresholdDate };
}
