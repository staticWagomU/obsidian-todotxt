/**
 * Keyboard shortcut definitions for settings display and customization
 */

export interface ShortcutDefinition {
	/** Unique identifier for the shortcut */
	id: string;
	/** Default key binding */
	key: string;
	/** Human-readable description */
	description: string;
	/** Category for grouping in settings */
	category: "navigation" | "action" | "global";
	/** Custom key binding set by user (optional) */
	customKey?: string;
}

/**
 * Default keyboard shortcuts with unique IDs for customization
 */
export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
	// Navigation shortcuts
	{ id: "nav-up", key: "ArrowUp", description: "前のタスクに移動", category: "navigation" },
	{ id: "nav-down", key: "ArrowDown", description: "次のタスクに移動", category: "navigation" },

	// Action shortcuts
	{ id: "action-toggle", key: "Enter", description: "タスクの完了/未完了を切替", category: "action" },
	{ id: "action-edit", key: "E", description: "タスクを編集", category: "action" },
	{ id: "action-delete", key: "Delete", description: "タスクを削除", category: "action" },

	// Global shortcuts (Ctrl/Cmd modifier)
	{ id: "global-new-task", key: "Ctrl+N / Cmd+N", description: "新規タスク作成ダイアログを開く", category: "global" },
	{ id: "global-search", key: "Ctrl+F / Cmd+F", description: "検索ボックスにフォーカス", category: "global" },
	{ id: "global-undo", key: "Ctrl+Z / Cmd+Z", description: "元に戻す (Undo)", category: "global" },
	{ id: "global-redo", key: "Ctrl+Shift+Z / Cmd+Shift+Z", description: "やり直し (Redo)", category: "global" },
	{ id: "global-redo-win", key: "Ctrl+Y", description: "やり直し (Redo) - Windows", category: "global" },
];

/**
 * Legacy export for backward compatibility
 * @deprecated Use DEFAULT_SHORTCUTS instead
 */
export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = DEFAULT_SHORTCUTS;

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

/**
 * Detect key conflicts when setting a custom key
 *
 * @param shortcuts - Array of shortcut definitions
 * @param customKeys - Record of shortcut ID to custom key
 * @param newKey - The new key to check for conflicts
 * @param targetId - The ID of the shortcut being modified
 * @returns Array of conflicting shortcut IDs (empty if no conflicts)
 */
export function detectKeyConflict(
	shortcuts: ShortcutDefinition[],
	customKeys: Record<string, string>,
	newKey: string,
	targetId: string
): string[] {
	const normalizedNewKey = newKey.toLowerCase();
	const conflicts: string[] = [];

	for (const shortcut of shortcuts) {
		// Skip the shortcut being modified
		if (shortcut.id === targetId) {
			continue;
		}

		// Get the effective key for this shortcut (custom key takes precedence)
		const effectiveKey = customKeys[shortcut.id] ?? shortcut.key;
		const normalizedEffectiveKey = effectiveKey.toLowerCase();

		// Check for conflict
		if (normalizedEffectiveKey === normalizedNewKey) {
			conflicts.push(shortcut.id);
		}
	}

	return conflicts;
}

/**
 * Result of setting a custom key
 */
export interface SetKeyResult {
	/** Whether the operation was successful */
	success: boolean;
	/** Array of conflicting shortcut IDs if conflict detected */
	conflicts: string[];
}

/**
 * ShortcutManager manages custom key bindings for shortcuts
 * Provides CRUD operations and conflict detection
 */
export class ShortcutManager {
	private shortcuts: ShortcutDefinition[];
	private customKeys: Record<string, string>;

	/**
	 * Create a new ShortcutManager
	 * @param initialCustomKeys - Optional initial custom key bindings from settings
	 */
	constructor(initialCustomKeys: Record<string, string> = {}) {
		this.shortcuts = DEFAULT_SHORTCUTS;
		this.customKeys = { ...initialCustomKeys };
	}

	/**
	 * Get all shortcut definitions
	 */
	getAllShortcuts(): ShortcutDefinition[] {
		return this.shortcuts;
	}

	/**
	 * Get custom key for a specific shortcut
	 * @param id - Shortcut ID
	 * @returns Custom key or undefined if not set
	 */
	getCustomKey(id: string): string | undefined {
		return this.customKeys[id];
	}

	/**
	 * Get effective key for a shortcut (custom key if set, otherwise default)
	 * @param id - Shortcut ID
	 * @returns Effective key or undefined if shortcut not found
	 */
	getEffectiveKey(id: string): string | undefined {
		const shortcut = this.shortcuts.find((s) => s.id === id);
		if (!shortcut) {
			return undefined;
		}
		return this.customKeys[id] ?? shortcut.key;
	}

	/**
	 * Set a custom key for a shortcut
	 * @param id - Shortcut ID
	 * @param newKey - New key binding
	 * @returns Result with success status and any conflicts
	 */
	setCustomKey(id: string, newKey: string): SetKeyResult {
		const shortcut = this.shortcuts.find((s) => s.id === id);
		if (!shortcut) {
			return { success: false, conflicts: [] };
		}

		const conflicts = detectKeyConflict(
			this.shortcuts,
			this.customKeys,
			newKey,
			id
		);

		if (conflicts.length > 0) {
			return { success: false, conflicts };
		}

		this.customKeys[id] = newKey;
		return { success: true, conflicts: [] };
	}

	/**
	 * Remove custom key for a shortcut, reverting to default
	 * @param id - Shortcut ID
	 */
	removeCustomKey(id: string): void {
		delete this.customKeys[id];
	}

	/**
	 * Get all custom keys
	 * @returns Copy of custom keys record
	 */
	getCustomKeys(): Record<string, string> {
		return { ...this.customKeys };
	}

	/**
	 * Get shortcut definition by ID
	 * @param id - Shortcut ID
	 * @returns Shortcut definition or undefined if not found
	 */
	getShortcutById(id: string): ShortcutDefinition | undefined {
		return this.shortcuts.find((s) => s.id === id);
	}
}
