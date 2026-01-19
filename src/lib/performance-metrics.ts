/**
 * Performance Metrics Utilities
 * Sprint 64 - PBI-063: AC2, AC3 対応
 *
 * AC2: 1000件のタスクでも初期表示が500ms以内に完了する
 * AC3: スクロール時のFPSが50fps以上を維持する（≤20ms/frame）
 */

/**
 * Metric type for categorizing performance measurements
 */
export type MetricType = "render" | "scroll" | "filter" | "sort";

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
	/** Type of operation measured */
	type: MetricType;
	/** Duration in milliseconds */
	duration: number;
	/** Timestamp when measurement was taken */
	timestamp: number;
	/** Optional label for identification */
	label?: string;
}

/**
 * Result of a timed render operation
 */
export interface RenderTimeResult<T> {
	/** Duration in milliseconds */
	duration: number;
	/** Return value of the measured function */
	value: T;
}

/**
 * Result of scroll handler timing
 */
export interface ScrollHandlerResult<T> {
	/** Duration in milliseconds */
	duration: number;
	/** Return value of the handler */
	value: T;
	/** Whether the duration is within the target budget */
	withinBudget: boolean;
	/** Target time budget in milliseconds */
	targetBudget: number;
}

/**
 * Performance monitor interface for tracking metrics over time
 */
export interface PerformanceMetrics {
	recordMetric: (metric: PerformanceMetric) => void;
	getMetrics: (type?: MetricType) => PerformanceMetric[];
	getAverageRenderTime: () => number;
	getMaxRenderTime: () => number;
	getMaxScrollHandlerTime: () => number;
	meetsRenderTimeRequirement: (maxMs: number) => boolean;
	meetsScrollHandlerRequirement: (maxMs: number) => boolean;
	clear: () => void;
}

/**
 * Measure render time for a function (sync or async)
 *
 * Used to validate AC2: Initial render should complete within 500ms
 *
 * @param fn - Function to measure (can be sync or async)
 * @returns Promise with duration and return value
 */
export async function measureRenderTime<T>(
	fn: () => T | Promise<T>
): Promise<RenderTimeResult<T>> {
	const start = performance.now();
	const value = await fn();
	const duration = performance.now() - start;

	return { duration, value };
}

/**
 * Measure scroll handler execution time
 *
 * Used to validate AC3: Scroll handlers should complete within 20ms
 * (50fps = 20ms per frame)
 *
 * @param handler - Scroll handler function to measure
 * @param targetBudget - Maximum allowed time in ms (default: 20ms for 50fps)
 * @returns Result with duration, value, and budget check
 */
export function measureScrollHandlerTime<T>(
	handler: () => T,
	targetBudget: number = 20
): ScrollHandlerResult<T> {
	const start = performance.now();
	const value = handler();
	const duration = performance.now() - start;

	return {
		duration,
		value,
		withinBudget: duration <= targetBudget,
		targetBudget,
	};
}

/**
 * Create a performance monitor for tracking metrics over time
 *
 * Useful for:
 * - Collecting render time samples
 * - Tracking scroll handler performance
 * - Validating AC2/AC3 requirements
 *
 * @returns Performance monitor instance
 */
export function createPerformanceMonitor(): PerformanceMetrics {
	let metrics: PerformanceMetric[] = [];

	return {
		/**
		 * Record a new performance metric
		 */
		recordMetric(metric: PerformanceMetric): void {
			metrics.push(metric);
		},

		/**
		 * Get all metrics, optionally filtered by type
		 */
		getMetrics(type?: MetricType): PerformanceMetric[] {
			if (type === undefined) {
				return [...metrics];
			}
			return metrics.filter(m => m.type === type);
		},

		/**
		 * Calculate average render time from recorded metrics
		 */
		getAverageRenderTime(): number {
			const renderMetrics = metrics.filter(m => m.type === "render");
			if (renderMetrics.length === 0) {
				return 0;
			}
			const total = renderMetrics.reduce((sum, m) => sum + m.duration, 0);
			return total / renderMetrics.length;
		},

		/**
		 * Get maximum render time from recorded metrics
		 */
		getMaxRenderTime(): number {
			const renderMetrics = metrics.filter(m => m.type === "render");
			if (renderMetrics.length === 0) {
				return 0;
			}
			return Math.max(...renderMetrics.map(m => m.duration));
		},

		/**
		 * Get maximum scroll handler time from recorded metrics
		 */
		getMaxScrollHandlerTime(): number {
			const scrollMetrics = metrics.filter(m => m.type === "scroll");
			if (scrollMetrics.length === 0) {
				return 0;
			}
			return Math.max(...scrollMetrics.map(m => m.duration));
		},

		/**
		 * Check if all render times meet the requirement
		 * AC2: Initial render should complete within 500ms
		 */
		meetsRenderTimeRequirement(maxMs: number): boolean {
			const renderMetrics = metrics.filter(m => m.type === "render");
			return renderMetrics.every(m => m.duration <= maxMs);
		},

		/**
		 * Check if all scroll handlers meet the requirement
		 * AC3: Scroll handlers should complete within 20ms (50fps)
		 */
		meetsScrollHandlerRequirement(maxMs: number): boolean {
			const scrollMetrics = metrics.filter(m => m.type === "scroll");
			return scrollMetrics.every(m => m.duration <= maxMs);
		},

		/**
		 * Clear all recorded metrics
		 */
		clear(): void {
			metrics = [];
		},
	};
}
