/**
 * decompose-prompt.ts - タスク分解プロンプト構築
 * PBI-067 AC2, AC5対応
 */

/**
 * タスク分解用のプロンプトを構築する
 * @param taskDescription 分解対象のタスク説明
 * @param currentDate 現在日付 (YYYY-MM-DD)
 * @param customInstruction カスタム指示（オプション）
 * @param projects プロジェクトリスト（オプション）
 * @param contexts コンテキストリスト（オプション）
 * @returns 構築されたプロンプト文字列
 */
export function buildDecomposePrompt(
	taskDescription: string,
	currentDate: string,
	customInstruction?: string,
	projects?: string[],
	contexts?: string[],
): string {
	const sections: string[] = [
		`あなたはタスク管理の専門家です。以下のタスクを実行可能なサブタスクに分解してください。`,
		`## 分解対象タスク
${taskDescription}`,
		`## 分解ルール
1. 3-7個のサブタスクに分解する
2. 各サブタスクは具体的で実行可能な単位にする
3. サブタスクは論理的な順序で並べる
4. 各サブタスクはtodo.txt形式で出力する`,
		`## todo.txt形式ルール
- 作成日: ${currentDate} を使用（YYYY-MM-DD形式で先頭に付与）
- プロジェクト: +ProjectName 形式
- コンテキスト: @context 形式
- 期限: due:YYYY-MM-DD 形式`,
	];

	// プロジェクト情報がある場合
	if (projects && projects.length > 0) {
		const projectTags = projects.map(p => `+${p}`).join(" ");
		sections.push(`## 継承するプロジェクト
サブタスクには以下のプロジェクトタグを継承してください: ${projectTags}`);
	}

	// コンテキスト情報がある場合
	if (contexts && contexts.length > 0) {
		const contextTags = contexts.map(c => `@${c}`).join(" ");
		sections.push(`## 継承するコンテキスト
サブタスクには以下のコンテキストタグを継承してください: ${contextTags}`);
	}

	// カスタム指示がある場合
	if (customInstruction) {
		sections.push(`## 追加の指示
${customInstruction}`);
	}

	sections.push(`## 出力形式
todo.txt形式のサブタスクのみを出力（説明不要、1タスク1行）`);

	return sections.join("\n\n");
}

/**
 * AI応答をパースしてサブタスク配列に変換する
 * @param response AI応答文字列
 * @returns サブタスク文字列の配列
 */
export function parseDecomposeResponse(response: string): string[] {
	return response
		.split("\n")
		.map(line => line.trim())
		.filter(line => line.length > 0)
		.map(line => {
			// 番号付きリスト (1. や 1) など) を除去
			let cleaned = line.replace(/^\d+[.)]\s*/, "");
			// ハイフン付きリスト (- ) を除去
			cleaned = cleaned.replace(/^-\s*/, "");
			// アスタリスク付きリスト (* ) を除去
			cleaned = cleaned.replace(/^\*\s*/, "");
			return cleaned.trim();
		})
		.filter(line => line.length > 0);
}
