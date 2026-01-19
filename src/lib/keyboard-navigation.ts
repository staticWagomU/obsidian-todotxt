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
 */
export class KeyboardActionHandler {
	private callbacks: KeyboardActionCallbacks;

	constructor(callbacks: KeyboardActionCallbacks) {
		this.callbacks = callbacks;
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
	 */
	getActionForKey(key: string): KeyboardAction | null {
		switch (key) {
			case "ArrowDown":
				return "moveDown";
			case "ArrowUp":
				return "moveUp";
			case "Enter":
				return "toggle";
			case "e":
			case "E":
				return "edit";
			case "Delete":
			case "Backspace":
				return "delete";
			default:
				return null;
		}
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
