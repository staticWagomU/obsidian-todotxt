/**
 * Virtual Scroller Configuration
 * Sprint 64 - PBI-063: AC1, AC5対応（パフォーマンス最適化）
 */
export interface VirtualScrollerConfig {
	/** Height of each item in pixels */
	itemHeight: number;
	/** Height of the visible container in pixels */
	containerHeight: number;
	/** Total number of items */
	totalItems: number;
	/** Number of items to render outside visible area (default: 3) */
	overscan?: number;
}

/**
 * Visible range of items
 */
export interface VisibleRange {
	/** Start index (inclusive) */
	startIndex: number;
	/** End index (inclusive) */
	endIndex: number;
}

/**
 * VirtualScroller class for efficient rendering of large lists
 * 
 * Implements virtual scrolling to only render visible items,
 * significantly reducing DOM nodes and improving performance.
 * 
 * Sprint 64 - PBI-063: AC1対応
 */
export class VirtualScroller {
	private config: Required<VirtualScrollerConfig>;

	constructor(config: VirtualScrollerConfig) {
		this.config = {
			...config,
			overscan: config.overscan ?? 3,
		};
	}

	/**
	 * Get current configuration
	 */
	getConfig(): Required<VirtualScrollerConfig> {
		return { ...this.config };
	}

	/**
	 * Calculate visible range based on scroll position
	 * 
	 * @param scrollTop - Current scroll position in pixels
	 * @returns VisibleRange with start and end indices
	 */
	getVisibleRange(scrollTop: number): VisibleRange {
		const { itemHeight, containerHeight, totalItems } = this.config;

		// Handle empty list
		if (totalItems === 0) {
			return { startIndex: 0, endIndex: -1 };
		}

		// Calculate visible items count
		const visibleCount = Math.ceil(containerHeight / itemHeight);

		// Calculate start index from scroll position
		const startIndex = Math.floor(scrollTop / itemHeight);

		// Calculate end index (inclusive)
		const endIndex = Math.min(startIndex + visibleCount - 1, totalItems - 1);

		return { startIndex, endIndex };
	}

	/**
	 * Get total scrollable height
	 * 
	 * @returns Total height in pixels
	 */
	getTotalHeight(): number {
		return this.config.itemHeight * this.config.totalItems;
	}

	/**
	 * Get item offset from top
	 * 
	 * @param index - Item index
	 * @returns Offset in pixels from top
	 */
	getItemOffset(index: number): number {
		return index * this.config.itemHeight;
	}

	/**
	 * Update configuration (partial update)
	 * 
	 * @param updates - Partial configuration to update
	 */
	updateConfig(updates: Partial<VirtualScrollerConfig>): void {
		this.config = {
			...this.config,
			...updates,
			overscan: updates.overscan ?? this.config.overscan,
		};
	}
}
