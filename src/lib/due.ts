/**
 * due:タグからDate型を抽出する
 * @param tags タグ配列
 * @returns Date型、またはundefined
 */
export function getDueDate(tags: string[]): Date | undefined {
	const dueTag = tags.find((tag) => tag.startsWith("due:"));
	if (!dueTag) return undefined;

	const dateStr = dueTag.substring(4);
	if (!dateStr) return undefined;

	// YYYY-MM-DD形式の検証 (正規表現で厳密にチェック)
	const datePattern = /^\d{4}-\d{2}-\d{2}$/;
	if (!datePattern.test(dateStr)) return undefined;

	const date = new Date(dateStr);
	// 無効な日付チェック (例: 2026-13-01や2026-02-30など)
	if (Number.isNaN(date.getTime())) return undefined;

	return date;
}
