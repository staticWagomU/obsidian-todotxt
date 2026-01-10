/**
 * Date picker utilities
 * HTML5 date input (<input type="date">) format conversion utilities
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_INDEX_OFFSET = 1;

/**
 * 日付が自動補正されていないかをチェック
 * 例: 2026-02-30 -> 2026-03-02 のような変換を検出
 * @param date Date object
 * @param dateStr 元の日付文字列
 * @returns 自動補正されている場合true
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
 * @returns 有効な日付の場合Date型、無効な場合null
 */
function parseValidDate(dateStr: string): Date | null {
	// YYYY-MM-DD形式の検証
	if (!ISO_DATE_PATTERN.test(dateStr)) return null;

	const date = new Date(dateStr);
	// 無効な日付チェック
	if (Number.isNaN(date.getTime())) return null;

	// 日付の自動補正チェック（例: 2026-02-30 -> 2026-03-02）
	if (isDateAutoAdjusted(date, dateStr)) return null;

	return date;
}

/**
 * Date objectをYYYY-MM-DD形式の文字列に変換する（HTML5 date input用）
 * @param date Date object、またはnull
 * @returns YYYY-MM-DD形式の文字列、nullの場合は空文字列
 */
export function formatDateForInput(date: Date | null): string {
	if (!date) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + MONTH_INDEX_OFFSET).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD形式の文字列をDate objectに変換する（HTML5 date input用）
 * @param dateStr YYYY-MM-DD形式の文字列
 * @returns Date object、無効な場合はnull
 */
export function parseDateFromInput(dateStr: string): Date | null {
	if (dateStr.trim().length === 0) return null;
	return parseValidDate(dateStr);
}
