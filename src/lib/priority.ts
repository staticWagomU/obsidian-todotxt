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
