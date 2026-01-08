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
	const parts = dateStr.split("-").map(Number);
	const yearInput = parts[0];
	const monthInput = parts[1];
	const dayInput = parts[2];

	if (
		yearInput === undefined ||
		monthInput === undefined ||
		dayInput === undefined
	) {
		return true; // 不正な形式は自動補正として扱う
	}

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

/**
 * しきい値日付状態の型定義
 */
export type ThresholdDateStatus = "not_ready" | "ready";

/**
 * 日付から時刻部分を削除し、日付のみを返す（00:00:00にリセット）
 * @param date 日付
 * @returns 時刻がリセットされた日付
 */
function toDateOnly(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const MILLISECONDS_IN_DAY = 86400000;

/**
 * 2つの日付の差を日数で計算する
 * @param date1 比較元の日付
 * @param date2 比較先の日付
 * @returns 日数の差（date1 - date2）
 */
function calculateDaysDifference(date1: Date, date2: Date): number {
	const diffInMilliseconds = date1.getTime() - date2.getTime();
	return diffInMilliseconds / MILLISECONDS_IN_DAY;
}

/**
 * しきい値日付と現在日付を比較し、状態を判定する
 * @param todo Todoオブジェクト
 * @param today 現在日付
 * @returns しきい値状態 (not_ready: 未来/ready: 本日または過去) またはnull
 */
export function getThresholdDateStatus(
	todo: { tags: Record<string, string> },
	today: Date,
): ThresholdDateStatus | null {
	const thresholdDate = getThresholdDate(todo.tags);
	if (!thresholdDate) return null;

	const thresholdDateOnly = toDateOnly(thresholdDate);
	const todayOnly = toDateOnly(today);

	const diffInDays = calculateDaysDifference(thresholdDateOnly, todayOnly);

	const isThresholdInFuture = diffInDays > 0;
	if (isThresholdInFuture) return "not_ready";
	return "ready";
}
