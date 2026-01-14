/**
 * Build edit prompt for AI-powered task editing
 */

import type { Todo } from "../lib/todo";

/**
 * Build system prompt for editing existing todo with natural language instruction
 */
export function buildEditPrompt(
	todo: Todo,
	instruction: string,
	currentDate: string,
	customContexts: Record<string, string>,
): string {
	const currentTodoLine = todo.raw || todo.description;
	
	const sections = [
		`あなたはタスク管理の専門家です。既存のtodo.txtタスクを自然言語の指示に従って編集してください。`,
		`## 現在のタスク
${currentTodoLine}`,
		`## 編集指示
${instruction}`,
		`## todo.txt形式ルール
1. 完了: 行頭に "x " を付与
2. 優先度: (A) から (Z) の大文字、行頭に配置
3. 作成日: YYYY-MM-DD 形式
4. プロジェクト: +ProjectName 形式
5. コンテキスト: @context 形式
6. 期限: due:YYYY-MM-DD 形式
7. しきい値日: t:YYYY-MM-DD 形式`,
		`## 編集ルール
- 既存の要素を保持し、指示された変更のみを適用
- 日付の相対表現（明日、来週など）は絶対日付に変換（今日: ${currentDate}）
- 優先度変更時は適切な大文字の括弧形式を使用
- コンテキスト判定: ${buildContextMappings(customContexts)}`,
		`## 出力形式
編集後のtodo.txt形式の1行のみを出力（説明不要）`,
	];

	return sections.join("\n\n");
}

/**
 * Build context mappings section
 */
function buildContextMappings(customContexts: Record<string, string>): string {
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
		.join(", ");

	return contextList || "@context形式を使用";
}
