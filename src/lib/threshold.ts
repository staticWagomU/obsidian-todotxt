const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_INDEX_OFFSET = 1;

/**
 * 日付文字列がYYYY-MM-DD形式かを検証
 */
function isValidDateFormat(dateStr: string): boolean {
	return ISO_DATE_PATTERN.test(dateStr);
}

/**
 * 日付が自動補正されていないかをチェック
 * 例: 2026-02-30 -> 2026-03-02 のような変換を検出
 */
function isDateAutoAdjusted(date: Date, dateStr: string): boolean {
	const [yearInput, monthInput, dayInput] = dateStr.split("-").map(Number);
	return (
		date.getFullYear() !== yearInput ||
		date.getMonth() !== monthInput - MONTH_INDEX_OFFSET ||
		date.getDate() !== dayInput
	);
}

/**
 * YYYY-MM-DD形式の文字列が有効な日付かを検証する
 * @param dateStr 日付文字列
 * @returns 有効な日付の場合Date型、無効な場合undefined
 */
function parseValidDate(dateStr: string): Date | undefined {
	if (!isValidDateFormat(dateStr)) return undefined;

	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return undefined;

	if (isDateAutoAdjusted(date, dateStr)) return undefined;

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
