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

/**
 * 優先度バッジのスタイルオブジェクトを返す
 * @param priority 優先度 (A-Z または undefined)
 * @returns CSSスタイルオブジェクト
 */
export function getPriorityBadgeStyle(
  priority?: string,
): Record<string, string> {
  if (!shouldShowPriorityBadge(priority)) {
    return { display: "none" };
  }

  return {
    display: "inline-block",
    backgroundColor: getPriorityColor(priority),
    color: "#ffffff",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "0.85em",
    fontWeight: "bold",
    marginRight: "4px",
  };
}

/**
 * 優先度を正規化する
 * @param priority 優先度 (a-z, A-Z, または undefined)
 * @returns 正規化された優先度 (A-Z または undefined)
 */
export function normalizePriority(priority?: string): string | undefined {
  if (priority === undefined) {
    return undefined;
  }

  const normalized = priority.toUpperCase();

  // A-Zの単一文字のみ有効
  if (normalized.length === 1 && normalized >= "A" && normalized <= "Z") {
    return normalized;
  }

  return undefined;
}

/**
 * 優先度バッジのARIAラベルを返す
 * @param priority 優先度 (A-Z または undefined)
 * @returns ARIAラベル文字列
 */
export function getPriorityBadgeAriaLabel(priority?: string): string {
  if (!shouldShowPriorityBadge(priority)) {
    return "";
  }

  return `Priority ${priority}`;
}
