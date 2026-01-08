/**
 * 優先度に応じた色コードを返す
 * @param priority 優先度 (A-Z または undefined)
 * @returns 色コード
 */
export function getPriorityColor(priority?: string): string {
  if (priority === "A") return "#ff4444";
  if (priority === "B") return "#ff9944";
  if (priority === "C") return "#ffdd44";
  return "#cccccc";
}

/**
 * 優先度バッジを表示すべきかを判定する
 * @param priority 優先度 (A-Z または undefined)
 * @returns バッジを表示する場合はtrue、表示しない場合はfalse
 */
export function shouldShowPriorityBadge(priority?: string): boolean {
  return priority !== undefined;
}
