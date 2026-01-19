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
 * Visible range of items (basic)
 */
export interface VisibleRange {
	/** Start index (inclusive) */
	startIndex: number;
	/** End index (inclusive) */
	endIndex: number;
}

/**
 * Extended visible range with additional metadata
 */
export interface VisibleRangeExtended extends VisibleRange {
	/** Number of visible items */
	visibleCount: number;
	/** Offset from top for start position */
	offsetTop: number;
}

/**
 * Parameters for calculateVisibleRange function
 */
export interface CalculateVisibleRangeParams {
	scrollTop: number;
	itemHeight: number;
	containerHeight: number;
	totalItems: number;
}

/**
 * Parameters for calculateVisibleRangeWithOverscan function
 */
export interface CalculateVisibleRangeWithOverscanParams extends CalculateVisibleRangeParams {
	overscan: number;
}

/**
 * Extended visible range with render count for overscan
 */
export interface VisibleRangeWithOverscan extends VisibleRangeExtended {
	/** Number of items to render (including overscan) */
	renderCount: number;
}

/**
 * Calculate visible range from scroll position
 *
 * Pure function for calculating which items are visible given scroll position.
 * Handles edge cases like negative scroll, beyond-end scroll, empty list, etc.
 *
 * @param params - Calculation parameters
 * @returns Extended visible range with count and offset
 */
export function calculateVisibleRange(params: CalculateVisibleRangeParams): VisibleRangeExtended {
	const { scrollTop, itemHeight, containerHeight, totalItems } = params;

	// Handle empty list
	if (totalItems === 0) {
		return {
			startIndex: 0,
			endIndex: -1,
			visibleCount: 0,
			offsetTop: 0,
		};
	}

	// Clamp scroll position to valid range
	const clampedScrollTop = Math.max(0, scrollTop);

	// Calculate start index from scroll position
	const startIndex = Math.min(
		Math.floor(clampedScrollTop / itemHeight),
		totalItems - 1
	);

	// Calculate visible items count (at least 1)
	// Use ceiling to ensure partial items are counted
	const visibleCount = Math.max(1, Math.ceil(containerHeight / itemHeight));

	// For partial scroll positions, we might see one extra item
	const scrollOffset = clampedScrollTop % itemHeight;
	const extraItem = scrollOffset > 0 ? 1 : 0;

	// Calculate end index (inclusive), clamped to totalItems
	const endIndex = Math.min(
		startIndex + visibleCount - 1 + extraItem,
		totalItems - 1
	);

	// Calculate actual visible count
	const actualVisibleCount = endIndex - startIndex + 1;

	// Calculate offset for positioning
	const offsetTop = startIndex * itemHeight;

	return {
		startIndex,
		endIndex,
		visibleCount: actualVisibleCount,
		offsetTop,
	};
}

/**
 * Calculate visible range with overscan buffer
 *
 * Adds buffer items before and after the visible range to reduce
 * flickering during scrolling. This is the primary function for
 * virtual scrolling implementation.
 *
 * Sprint 64 - PBI-063: AC1, AC5対応
 *
 * @param params - Calculation parameters including overscan
 * @returns Extended visible range with render count
 */
export function calculateVisibleRangeWithOverscan(
	params: CalculateVisibleRangeWithOverscanParams
): VisibleRangeWithOverscan {
	const { scrollTop, itemHeight, containerHeight, totalItems, overscan } = params;

	// Handle empty list
	if (totalItems === 0) {
		return {
			startIndex: 0,
			endIndex: -1,
			visibleCount: 0,
			offsetTop: 0,
			renderCount: 0,
		};
	}

	// First calculate the visible range without overscan
	const visibleRange = calculateVisibleRange({
		scrollTop,
		itemHeight,
		containerHeight,
		totalItems,
	});

	// Apply overscan to start index (clamp to 0)
	const overscanStartIndex = Math.max(0, visibleRange.startIndex - overscan);

	// Apply overscan to end index (clamp to totalItems - 1)
	const overscanEndIndex = Math.min(totalItems - 1, visibleRange.endIndex + overscan);

	// Calculate render count
	const renderCount = overscanEndIndex - overscanStartIndex + 1;

	// Calculate offset for positioning
	const offsetTop = overscanStartIndex * itemHeight;

	return {
		startIndex: overscanStartIndex,
		endIndex: overscanEndIndex,
		visibleCount: visibleRange.visibleCount,
		offsetTop,
		renderCount,
	};
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
