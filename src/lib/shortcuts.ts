/**
 * Keyboard shortcut definitions for settings display
 */

export interface ShortcutDefinition {
	key: string;
	description: string;
	category: "navigation" | "action" | "global";
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
	// Navigation shortcuts
	{ key: "ArrowUp", description: "前のタスクに移動", category: "navigation" },
	{ key: "ArrowDown", description: "次のタスクに移動", category: "navigation" },

	// Action shortcuts
	{ key: "Enter", description: "タスクの完了/未完了を切替", category: "action" },
	{ key: "E", description: "タスクを編集", category: "action" },
	{ key: "Delete", description: "タスクを削除", category: "action" },

	// Global shortcuts (Ctrl/Cmd modifier)
	{ key: "Ctrl+N / Cmd+N", description: "新規タスク作成ダイアログを開く", category: "global" },
	{ key: "Ctrl+F / Cmd+F", description: "検索ボックスにフォーカス", category: "global" },
	{ key: "Ctrl+Z / Cmd+Z", description: "元に戻す (Undo)", category: "global" },
	{ key: "Ctrl+Shift+Z / Cmd+Shift+Z", description: "やり直し (Redo)", category: "global" },
	{ key: "Ctrl+Y", description: "やり直し (Redo) - Windows", category: "global" },
];

/**
 * Format shortcut key for display
 * Note: Platform detection is not available in this context (Obsidian settings)
 * so we show both Ctrl and Cmd for cross-platform clarity
 */
export function formatShortcutKey(key: string): string {
	return key
		.replace("ArrowUp", "\u2191")    // Up arrow
		.replace("ArrowDown", "\u2193")  // Down arrow
		.replace("Delete", "Del");
}
