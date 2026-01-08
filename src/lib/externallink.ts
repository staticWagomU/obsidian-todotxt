/**
 * Markdown外部リンクの型定義
 */
export interface ExternalLink {
	text: string; // 表示テキスト
	url: string; // URL
}

/**
 * テキストからMarkdown外部リンク[text](url)を抽出する
 * @param description テキスト文字列
 * @returns 外部リンクの配列
 */
export function extractExternalLinks(description: string): ExternalLink[] {
	// [text](url)パターンにマッチする正規表現(グローバルマッチ)
	const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
	const matches = description.matchAll(markdownLinkPattern);

	const links: ExternalLink[] = [];
	for (const match of matches) {
		const text = match[1];
		const url = match[2];
		links.push({ text, url });
	}

	return links;
}
