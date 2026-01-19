import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	measureRenderTime,
	measureScrollHandlerTime,
	createPerformanceMonitor,
	type PerformanceMetrics,
} from "./performance-metrics";

/**
 * Sprint 64 - Subtask 5: パフォーマンス計測ユーティリティテスト (AC2, AC3)
 *
 * AC2: 1000件のタスクでも初期表示が500ms以内に完了する
 * AC3: スクロール時のFPSが50fps以上を維持する（ハンドラ実行時間≤20ms）
 */
describe("PerformanceMetrics", () => {
	describe("measureRenderTime", () => {
		it("should measure time for synchronous function", async () => {
			const syncFn = () => {
				// Simulate some work
				let sum = 0;
				for (let i = 0; i < 1000; i++) {
					sum += i;
				}
				return sum;
			};

			const result = await measureRenderTime(syncFn);

			expect(result.duration).toBeGreaterThanOrEqual(0);
			expect(result.value).toBe(499500); // Sum of 0-999
		});

		it("should measure time for async function", async () => {
			const asyncFn = async () => {
				await new Promise(resolve => setTimeout(resolve, 10));
				return "done";
			};

			const result = await measureRenderTime(asyncFn);

			expect(result.duration).toBeGreaterThanOrEqual(10);
			expect(result.value).toBe("done");
		});

		it("should return duration in milliseconds", async () => {
			const fn = () => "test";

			const result = await measureRenderTime(fn);

			expect(typeof result.duration).toBe("number");
			expect(result.duration).toBeLessThan(100); // Should be very fast
		});

		it("should handle functions that throw errors", async () => {
			const errorFn = () => {
				throw new Error("Test error");
			};

			await expect(measureRenderTime(errorFn)).rejects.toThrow("Test error");
		});
	});

	describe("measureScrollHandlerTime", () => {
		it("should measure scroll handler execution time", () => {
			const handler = () => {
				let sum = 0;
				for (let i = 0; i < 100; i++) {
					sum += i;
				}
				return sum;
			};

			const result = measureScrollHandlerTime(handler);

			expect(result.duration).toBeGreaterThanOrEqual(0);
			expect(result.value).toBe(4950);
		});

		it("should return true if handler completes within target time (20ms for 50fps)", () => {
			const fastHandler = () => "fast";

			const result = measureScrollHandlerTime(fastHandler);

			expect(result.withinBudget).toBe(true);
			expect(result.duration).toBeLessThan(20);
		});

		it("should allow custom time budget", () => {
			const handler = () => "test";

			const result = measureScrollHandlerTime(handler, 5);

			expect(result.targetBudget).toBe(5);
		});

		it("should use default 20ms budget (50fps requirement)", () => {
			const handler = () => "test";

			const result = measureScrollHandlerTime(handler);

			expect(result.targetBudget).toBe(20);
		});
	});

	describe("createPerformanceMonitor", () => {
		let monitor: ReturnType<typeof createPerformanceMonitor>;

		beforeEach(() => {
			monitor = createPerformanceMonitor();
		});

		it("should create a performance monitor instance", () => {
			expect(monitor).toBeDefined();
			expect(typeof monitor.recordMetric).toBe("function");
			expect(typeof monitor.getMetrics).toBe("function");
			expect(typeof monitor.getAverageRenderTime).toBe("function");
			expect(typeof monitor.clear).toBe("function");
		});

		it("should record and retrieve metrics", () => {
			monitor.recordMetric({ type: "render", duration: 100, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 150, timestamp: Date.now() });

			const metrics = monitor.getMetrics();

			expect(metrics).toHaveLength(2);
			expect(metrics[0]?.duration).toBe(100);
			expect(metrics[1]?.duration).toBe(150);
		});

		it("should calculate average render time", () => {
			monitor.recordMetric({ type: "render", duration: 100, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 200, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 300, timestamp: Date.now() });

			const average = monitor.getAverageRenderTime();

			expect(average).toBe(200);
		});

		it("should return 0 for average when no metrics", () => {
			const average = monitor.getAverageRenderTime();

			expect(average).toBe(0);
		});

		it("should filter metrics by type", () => {
			monitor.recordMetric({ type: "render", duration: 100, timestamp: Date.now() });
			monitor.recordMetric({ type: "scroll", duration: 5, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 150, timestamp: Date.now() });

			const renderMetrics = monitor.getMetrics("render");
			const scrollMetrics = monitor.getMetrics("scroll");

			expect(renderMetrics).toHaveLength(2);
			expect(scrollMetrics).toHaveLength(1);
		});

		it("should clear all metrics", () => {
			monitor.recordMetric({ type: "render", duration: 100, timestamp: Date.now() });
			monitor.recordMetric({ type: "scroll", duration: 5, timestamp: Date.now() });

			monitor.clear();

			expect(monitor.getMetrics()).toHaveLength(0);
		});

		it("should check if render time meets AC2 requirement (500ms)", () => {
			monitor.recordMetric({ type: "render", duration: 400, timestamp: Date.now() });

			expect(monitor.meetsRenderTimeRequirement(500)).toBe(true);
		});

		it("should fail AC2 requirement if render time exceeds 500ms", () => {
			monitor.recordMetric({ type: "render", duration: 600, timestamp: Date.now() });

			expect(monitor.meetsRenderTimeRequirement(500)).toBe(false);
		});

		it("should check if scroll handler meets AC3 requirement (20ms)", () => {
			monitor.recordMetric({ type: "scroll", duration: 15, timestamp: Date.now() });

			expect(monitor.meetsScrollHandlerRequirement(20)).toBe(true);
		});

		it("should fail AC3 requirement if scroll handler exceeds 20ms", () => {
			monitor.recordMetric({ type: "scroll", duration: 25, timestamp: Date.now() });

			expect(monitor.meetsScrollHandlerRequirement(20)).toBe(false);
		});

		it("should get max render time", () => {
			monitor.recordMetric({ type: "render", duration: 100, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 300, timestamp: Date.now() });
			monitor.recordMetric({ type: "render", duration: 200, timestamp: Date.now() });

			expect(monitor.getMaxRenderTime()).toBe(300);
		});

		it("should get max scroll handler time", () => {
			monitor.recordMetric({ type: "scroll", duration: 5, timestamp: Date.now() });
			monitor.recordMetric({ type: "scroll", duration: 15, timestamp: Date.now() });
			monitor.recordMetric({ type: "scroll", duration: 10, timestamp: Date.now() });

			expect(monitor.getMaxScrollHandlerTime()).toBe(15);
		});
	});

	describe("Performance requirements validation", () => {
		it("should validate AC2: render time under 500ms for typical operations", async () => {
			// Simulate a render operation
			const renderFn = () => {
				const items: number[] = [];
				for (let i = 0; i < 100; i++) {
					items.push(i);
				}
				return items;
			};

			const result = await measureRenderTime(renderFn);

			// AC2: Must complete within 500ms
			expect(result.duration).toBeLessThan(500);
		});

		it("should validate AC3: scroll handler under 20ms (50fps)", () => {
			// Simulate scroll handler
			const scrollHandler = () => {
				// Typical scroll calculations
				const visibleStart = Math.floor(100 / 40);
				const visibleEnd = Math.min(visibleStart + 10, 100);
				return { start: visibleStart, end: visibleEnd };
			};

			const result = measureScrollHandlerTime(scrollHandler);

			// AC3: Must complete within 20ms for 50fps
			expect(result.withinBudget).toBe(true);
			expect(result.duration).toBeLessThan(20);
		});
	});
});
