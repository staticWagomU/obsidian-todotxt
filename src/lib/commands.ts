/**
 * Command definitions for keyboard shortcuts
 * Stable IDs - never rename after release
 */

export interface CommandDefinition {
	id: string;
	name: string;
}

export const COMMANDS = {
	// Existing command
	openSidePanel: {
		id: "open-todotxt-side-panel",
		name: "サイドパネルを開く",
	},
	// New keyboard shortcut commands
	newTask: {
		id: "todotxt-new-task",
		name: "新規タスク作成",
	},
	focusSearch: {
		id: "todotxt-focus-search",
		name: "検索にフォーカス",
	},
} as const satisfies Record<string, CommandDefinition>;
