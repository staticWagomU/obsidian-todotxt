const DUE_TAG_PREFIX = "due:";
const DUE_TAG_PREFIX_LENGTH = 4;

/**
 * YYYY-MM-DD形式の文字列が有効な日付かを検証する
 * @param dateStr 日付文字列
 * @returns 有効な日付の場合Date型、無効な場合undefined
 */
function parseValidDate(dateStr: string): Date | undefined {
	// YYYY-MM-DD形式の検証 (正規表現で厳密にチェック)
	const datePattern = /^\d{4}-\d{2}-\d{2}$/;
	if (!datePattern.test(dateStr)) return undefined;

	const date = new Date(dateStr);
	// 無効な日付チェック (例: 2026-13-01や2026-02-30など)
	if (Number.isNaN(date.getTime())) return undefined;

	return date;
}

/**
 * due:タグからDate型を抽出する
 * @param tags タグ配列
 * @returns Date型、またはundefined
 */
export function getDueDate(tags: string[]): Date | undefined {
	const dueTag = tags.find((tag) => tag.startsWith(DUE_TAG_PREFIX));
	if (!dueTag) return undefined;

	const dateStr = dueTag.substring(DUE_TAG_PREFIX_LENGTH);
	if (!dateStr) return undefined;

	return parseValidDate(dateStr);
}

/**
 * 期限状態の型定義
 */
export type DueDateStatus = "overdue" | "today" | "future";

/**
 * 期限日付と現在日付を比較し、状態を判定する
 * @param dueDate 期限日付
 * @param today 現在日付
 * @returns 期限状態 (overdue/today/future)
 */
export function getDueDateStatus(dueDate: Date, today: Date): DueDateStatus {
	// 日付部分のみを比較するため、時刻を00:00:00にリセット
	const dueDateOnly = new Date(
		dueDate.getFullYear(),
		dueDate.getMonth(),
		dueDate.getDate(),
	);
	const todayOnly = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	const diffMs = dueDateOnly.getTime() - todayOnly.getTime();

	if (diffMs < 0) return "overdue";
	if (diffMs === 0) return "today";
	return "future";
}
