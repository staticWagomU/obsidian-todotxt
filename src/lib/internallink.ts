/**
 * Obsidian内部リンクの型定義
 */
export interface InternalLink {
	link: string; // リンク先ノート名
	alias?: string; // エイリアス(表示テキスト)
}

/**
 * wikilinkの内容をlink/aliasに分割する
 * @param linkContent [[...]]内の文字列
 * @returns InternalLink型オブジェクト
 */
function parseWikilinkContent(linkContent: string): InternalLink {
	// パイプ(|)が含まれている場合はエイリアス形式
	const pipeIndex = linkContent.indexOf("|");
	if (pipeIndex === -1) {
		// エイリアスなしの基本形式
		return { link: linkContent };
	}

	// エイリアス形式: [[link|alias]]
	const link = linkContent.substring(0, pipeIndex);
	const alias = linkContent.substring(pipeIndex + 1);
	return { link, alias };
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

	return [parseWikilinkContent(linkContent)];
}
