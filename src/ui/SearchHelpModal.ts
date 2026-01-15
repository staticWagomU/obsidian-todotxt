/**
 * SearchHelpModal - 検索ヘルプモーダル
 * 高度検索構文のヘルプを表示するモーダル
 */

import { Modal, type App } from "obsidian";

/**
 * Get search help content as markdown string
 */
export function getSearchHelpContent(): string {
	return `## 検索構文ヘルプ

### 基本検索
タスクの説明、プロジェクト、コンテキストを検索します。

### AND検索（空白区切り）
すべてのキーワードを含むタスクを検索
- 例: \`Buy milk\` - "Buy"と"milk"の両方を含むタスク

### OR検索（|で区切り）
いずれかのキーワードを含むタスクを検索
- 例: \`groceries|book\` - "groceries"または"book"を含むタスク

### NOT検索（-接頭辞）
キーワードを含まないタスクを検索
- 例: \`-completed\` - "completed"を含まないタスク
- 例: \`Buy -milk\` - "Buy"を含むが"milk"を含まないタスク

### 正規表現検索（/pattern/）
正規表現パターンでタスクを検索
- 例: \`/^Buy/\` - "Buy"で始まるタスク
- 例: \`/Task \\d+$/\` - "Task"の後に数字で終わるタスク

### 特殊構文検索
- \`project:work\` - プロジェクト"work"を持つタスク
- \`context:office\` - コンテキスト"office"を持つタスク
- \`priority:A\` - 優先度Aのタスク
- \`priority:none\` - 優先度なしのタスク
- \`due:2026-01-15\` - 期限が2026-01-15のタスク

### 日付範囲検索
- \`due:2026-01-01..2026-01-31\` - 期限が範囲内のタスク

### 組み合わせ例
- \`Buy project:shopping\` - "Buy"を含み、プロジェクト"shopping"を持つタスク
- \`due:2026-01-01..2026-01-31 priority:A\` - 期限が範囲内で優先度Aのタスク
- \`/urgent/ -completed\` - "urgent"を含むが"completed"を含まないタスク
`;
}

/**
 * Search help modal
 */
export class SearchHelpModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.classList.add("search-help-modal");

		// Title
		contentEl.createEl("h2", { text: "検索ヘルプ" });

		// Content container
		const content = contentEl.createEl("div");
		content.classList.add("search-help-content");

		// Parse and render content sections
		const helpContent = getSearchHelpContent();
		const lines = helpContent.split("\n");

		for (const line of lines) {
			if (line.startsWith("## ")) {
				// Main heading (already handled by title)
				continue;
			} else if (line.startsWith("### ")) {
				const heading = content.createEl("h3");
				heading.textContent = line.slice(4);
			} else if (line.startsWith("- ")) {
				const listItem = content.createEl("p");
				listItem.classList.add("search-help-example");
				listItem.textContent = line.slice(2);
			} else if (line.trim()) {
				const paragraph = content.createEl("p");
				paragraph.textContent = line;
			}
		}

		// Close button
		const closeButton = contentEl.createEl("button");
		closeButton.textContent = "閉じる";
		closeButton.classList.add("search-help-close");
		closeButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
