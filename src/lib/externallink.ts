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
 * @remarks
 * 対応URLスキーム: https://, http://, ftp://, file://, mailto: など
 * [^)]+パターンにより、閉じ括弧以外のすべての文字を許容
 */
export function extractExternalLinks(description: string): ExternalLink[] {
	// [text](url)パターンにマッチする正規表現(グローバルマッチ)
	// [^\]]+: 閉じブラケット以外の1文字以上を必須とし、空テキスト[]を除外
	// [^)]+: 閉じ括弧以外の1文字以上を必須とし、空URL()を除外
	// これにより、各種URLスキームに対応しつつ不正形式を自動的にフィルタ
	const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
	const matches = description.matchAll(markdownLinkPattern);

	const links: ExternalLink[] = [];
	for (const match of matches) {
		const text = match[1];
		const url = match[2];
		// 正規表現パターン[^\]]+と[^)]+により、textとurlは常に存在する
		if (!text || !url) continue;
		links.push({ text, url });
	}

	return links;
}
