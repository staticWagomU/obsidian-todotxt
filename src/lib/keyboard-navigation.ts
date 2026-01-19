import type { ShortcutManager } from "./shortcuts";

/**
 * Key mappings from key codes to actions
 */
export interface KeyMappings {
	moveDown: string;
	moveUp: string;
	toggle: string;
	edit: string;
	delete: string;
}

/**
 * Default key mappings
 */
export const DEFAULT_KEY_MAPPINGS: KeyMappings = {
	moveDown: "ArrowDown",
	moveUp: "ArrowUp",
	toggle: "Enter",
	edit: "E",
	delete: "Delete",
};

/**
 * Create key mappings from a ShortcutManager
 * @param manager - ShortcutManager instance with custom key bindings
 * @returns KeyMappings with effective keys (custom or default)
 */
export function createKeyMappings(manager: ShortcutManager): KeyMappings {
	return {
		moveDown: manager.getEffectiveKey("nav-down") ?? DEFAULT_KEY_MAPPINGS.moveDown,
		moveUp: manager.getEffectiveKey("nav-up") ?? DEFAULT_KEY_MAPPINGS.moveUp,
		toggle: manager.getEffectiveKey("action-toggle") ?? DEFAULT_KEY_MAPPINGS.toggle,
		edit: manager.getEffectiveKey("action-edit") ?? DEFAULT_KEY_MAPPINGS.edit,
		delete: manager.getEffectiveKey("action-delete") ?? DEFAULT_KEY_MAPPINGS.delete,
	};
}

/**
 * KeyboardNavigator manages keyboard navigation state for task list
 * Tracks selected index and provides navigation methods
 */
export class KeyboardNavigator {
	private selectedIndex: number = -1;
	private totalCount: number;

	constructor(totalCount: number) {
		this.totalCount = totalCount;
	}

	/**
	 * Get currently selected index (-1 means no selection)
	 */
	getSelectedIndex(): number {
		return this.selectedIndex;
	}

	/**
	 * Get total number of items
	 */
	getTotalCount(): number {
		return this.totalCount;
	}

	/**
	 * Set selected index with clamping
	 */
	setSelectedIndex(index: number): void {
		if (this.totalCount === 0) {
			this.selectedIndex = -1;
			return;
		}

		if (index < 0) {
			this.selectedIndex = -1;
		} else if (index >= this.totalCount) {
			this.selectedIndex = this.totalCount - 1;
		} else {
			this.selectedIndex = index;
		}
	}

	/**
	 * Clear selection
	 */
	clearSelection(): void {
		this.selectedIndex = -1;
	}

	/**
	 * Move selection down (Arrow Down key)
	 */
	moveDown(): void {
		if (this.totalCount === 0) return;

		if (this.selectedIndex === -1) {
			// No selection, select first item
			this.selectedIndex = 0;
		} else if (this.selectedIndex < this.totalCount - 1) {
			// Move to next item
			this.selectedIndex++;
		}
		// If at last item, stay there
	}

	/**
	 * Move selection up (Arrow Up key)
	 */
	moveUp(): void {
		if (this.totalCount === 0) return;

		if (this.selectedIndex === -1) {
			// No selection, select last item
			this.selectedIndex = this.totalCount - 1;
		} else if (this.selectedIndex > 0) {
			// Move to previous item
			this.selectedIndex--;
		}
		// If at first item, stay there
	}

	/**
	 * Update total count (e.g., when tasks are filtered)
	 */
	setTotalCount(count: number): void {
		this.totalCount = count;

		// Clamp selection if necessary
		if (count === 0) {
			this.selectedIndex = -1;
		} else if (this.selectedIndex >= count) {
			this.selectedIndex = count - 1;
		}
	}
}

/**
 * Action type for keyboard actions
 */
export type KeyboardAction = "moveDown" | "moveUp" | "toggle" | "edit" | "delete" | "undo" | "redo";

/**
 * Modifier keys state
 */
export interface ModifierKeys {
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
}

/**
 * Callbacks for keyboard actions
 */
export interface KeyboardActionCallbacks {
	onToggle: (index: number) => void;
	onEdit: (index: number) => void;
	onDelete: (index: number) => void;
}

/**
 * KeyboardActionHandler handles keyboard action execution
 * Maps key presses to actions and executes callbacks
 * Supports custom key mappings via optional KeyMappings parameter
 */
export class KeyboardActionHandler {
	private callbacks: KeyboardActionCallbacks;
	private keyMappings: KeyMappings;

	/**
	 * Create a new KeyboardActionHandler
	 * @param callbacks - Callbacks for actions
	 * @param keyMappings - Optional custom key mappings (defaults to DEFAULT_KEY_MAPPINGS)
	 */
	constructor(callbacks: KeyboardActionCallbacks, keyMappings?: KeyMappings) {
		this.callbacks = callbacks;
		this.keyMappings = keyMappings ?? DEFAULT_KEY_MAPPINGS;
	}

	/**
	 * Handle Enter key - toggle task completion
	 */
	handleEnter(selectedIndex: number): void {
		if (selectedIndex < 0) return;
		this.callbacks.onToggle(selectedIndex);
	}

	/**
	 * Handle E key - edit task
	 */
	handleEdit(selectedIndex: number): void {
		if (selectedIndex < 0) return;
		this.callbacks.onEdit(selectedIndex);
	}

	/**
	 * Handle Delete/Backspace key - delete task
	 */
	handleDelete(selectedIndex: number): void {
		if (selectedIndex < 0) return;
		this.callbacks.onDelete(selectedIndex);
	}

	/**
	 * Get action type for a given key
	 * Uses custom key mappings if provided, otherwise defaults
	 */
	getActionForKey(key: string): KeyboardAction | null {
		const normalizedKey = key.toLowerCase();
		const { moveDown, moveUp, toggle, edit, delete: deleteKey } = this.keyMappings;

		// Check custom/effective key mappings (case-insensitive for single-char keys)
		if (key === moveDown || normalizedKey === moveDown.toLowerCase()) {
			return "moveDown";
		}
		if (key === moveUp || normalizedKey === moveUp.toLowerCase()) {
			return "moveUp";
		}
		if (key === toggle || normalizedKey === toggle.toLowerCase()) {
			return "toggle";
		}
		if (key === edit || normalizedKey === edit.toLowerCase()) {
			return "edit";
		}
		if (key === deleteKey || normalizedKey === deleteKey.toLowerCase()) {
			return "delete";
		}
		// Also support Backspace as delete (hardcoded, not customizable)
		if (key === "Backspace") {
			return "delete";
		}

		return null;
	}

	/**
	 * Get action type for a key with modifier keys (Ctrl, Cmd, Shift)
	 * Used for undo (Ctrl/Cmd+Z) and redo (Ctrl/Cmd+Shift+Z or Ctrl+Y)
	 */
	getActionForModifiedKey(key: string, modifiers: ModifierKeys): KeyboardAction | null {
		const hasCtrlOrCmd = modifiers.ctrlKey || modifiers.metaKey;

		// Undo: Ctrl+Z or Cmd+Z (without Shift)
		if ((key === "z" || key === "Z") && hasCtrlOrCmd && !modifiers.shiftKey) {
			return "undo";
		}

		// Redo: Ctrl+Shift+Z, Cmd+Shift+Z, or Ctrl+Y
		if ((key === "z" || key === "Z") && hasCtrlOrCmd && modifiers.shiftKey) {
			return "redo";
		}
		if ((key === "y" || key === "Y") && modifiers.ctrlKey) {
			return "redo";
		}

		return null;
	}
}
