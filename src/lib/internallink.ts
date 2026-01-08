/**
 * Obsidian内部リンクの型定義
 */
export interface InternalLink {
	link: string; // リンク先ノート名
}

/**
 * テキストからObsidian内部リンク[[NoteName]]を抽出する
 * @param description テキスト文字列
 * @returns 内部リンクの配列
 */
export function extractInternalLinks(description: string): InternalLink[] {
	// [[...]]パターンにマッチする正規表現
	const wikilinkPattern = /\[\[([^\]]+)\]\]/;
	const match = wikilinkPattern.exec(description);

	if (!match) return [];

	const linkContent = match[1];
	if (!linkContent || linkContent.trim().length === 0) return [];

	return [{ link: linkContent }];
}
