const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_INDEX_OFFSET = 1;

/**
 * YYYY-MM-DD形式の文字列が有効な日付かを検証する
 * @param dateStr 日付文字列
 * @returns 有効な日付の場合Date型、無効な場合undefined
 */
function parseValidDate(dateStr: string): Date | undefined {
	// YYYY-MM-DD形式の検証 (正規表現で厳密にチェック)
	if (!ISO_DATE_PATTERN.test(dateStr)) return undefined;

	const date = new Date(dateStr);
	// 無効な日付チェック (例: 2026-13-01や2026-02-30など)
	if (Number.isNaN(date.getTime())) return undefined;

	// 日付が自動補正されていないかチェック
	// 例: 2026-02-30 -> 2026-03-02 のような変換を検出
	const [yearInput, monthInput, dayInput] = dateStr.split("-").map(Number);
	const isDateAutoAdjusted =
		date.getFullYear() !== yearInput ||
		date.getMonth() !== monthInput - MONTH_INDEX_OFFSET ||
		date.getDate() !== dayInput;

	if (isDateAutoAdjusted) return undefined;

	return date;
}

/**
 * t:タグからDate型を抽出する
 * @param tags タグオブジェクト
 * @returns Date型、またはnull
 */
export function getThresholdDate(tags: Record<string, string>): Date | null {
	const thresholdValue = tags.t;
	if (!thresholdValue) return null;

	const date = parseValidDate(thresholdValue);
	return date ?? null;
}
