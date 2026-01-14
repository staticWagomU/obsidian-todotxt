/**
 * Build project detection section
 */
function buildProjectSection(): string {
	return `## プロジェクト判定
文頭が以下のパターンの場合、後続のタスクにプロジェクトを付与：
- 「〇〇についてです」
- 「〇〇の件」
- 「〇〇関連」`;
}

/**
 * Build context detection section with custom mappings
 */
function buildContextSection(customContexts: Record<string, string>): string {
	const defaultContexts = {
		pc: "pc",
		phone: "phone",
		home: "home",
		office: "office",
		email: "email",
	};

	const allContexts = { ...defaultContexts, ...customContexts };
	const contextList = Object.entries(allContexts)
		.map(([k, v]) => `#${k} → @${v}`)
		.join("\n");

	return `## コンテキスト判定
入力文末の #keyword を以下のルールで変換：
${contextList}`;
}

/**
 * Build priority detection section
 */
function buildPrioritySection(): string {
	return `## 優先度判定
- 「緊急」「最優先」「すぐに」→ (A)
- 「重要」「優先」→ (B)
- 「急ぎ」→ (C)
- それ以外は優先度なし`;
}

/**
 * Build due date detection section
 */
function buildDueDateSection(currentDate: string): string {
	return `## 期限判定
相対的な日付表現を絶対日付に変換（今日: ${currentDate}）`;
}

/**
 * Build system prompt for natural language to todo.txt conversion
 */
export function buildSystemPrompt(
	currentDate: string,
	customContexts: Record<string, string>,
): string {
	const sections = [
		`あなたはタスク管理の専門家です。ユーザーの自然言語入力をtodo.txt形式に変換してください。`,
		`## 変換ルール
1. 各タスクは1行で表現
2. 作成日は ${currentDate} を使用（YYYY-MM-DD形式で先頭に付与）
3. プロジェクトは +ProjectName 形式
4. コンテキストは @context 形式
5. 期限は due:YYYY-MM-DD 形式`,
		buildProjectSection(),
		buildContextSection(customContexts),
		buildPrioritySection(),
		buildDueDateSection(currentDate),
		`## 出力形式
todo.txt形式のみを出力（説明不要、1タスク1行）`,
	];

	return sections.join("\n\n");
}
