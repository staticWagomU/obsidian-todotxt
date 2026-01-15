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
