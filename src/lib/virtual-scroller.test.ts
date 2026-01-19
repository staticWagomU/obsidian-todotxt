import { describe, it, expect } from "vitest";
import { VirtualScroller, calculateVisibleRange, calculateVisibleRangeWithOverscan, type VirtualScrollerConfig } from "./virtual-scroller";

describe("VirtualScroller", () => {
	describe("constructor", () => {
		it("should create VirtualScroller with default config", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});
			
			expect(scroller).toBeInstanceOf(VirtualScroller);
			expect(scroller.getConfig().itemHeight).toBe(40);
			expect(scroller.getConfig().containerHeight).toBe(400);
			expect(scroller.getConfig().totalItems).toBe(100);
		});

		it("should create VirtualScroller with custom overscan", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
				overscan: 5,
			});
			
			expect(scroller.getConfig().overscan).toBe(5);
		});

		it("should use default overscan of 3 if not provided", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});
			
			expect(scroller.getConfig().overscan).toBe(3);
		});
	});

	describe("getVisibleRange", () => {
		it("should return visible range at scroll position 0", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
				overscan: 0, // No overscan for simple test
			});
			
			const range = scroller.getVisibleRange(0);
			
			// containerHeight 400 / itemHeight 40 = 10 visible items
			expect(range.startIndex).toBe(0);
			expect(range.endIndex).toBe(9);
		});

		it("should return visible range at scroll position 200", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
				overscan: 0,
			});
			
			const range = scroller.getVisibleRange(200);
			
			// scrollTop 200 / itemHeight 40 = start at index 5
			// 5 + 10 visible - 1 = end at index 14
			expect(range.startIndex).toBe(5);
			expect(range.endIndex).toBe(14);
		});

		it("should clamp endIndex to totalItems - 1", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 10,
				overscan: 0,
			});
			
			const range = scroller.getVisibleRange(0);
			
			// totalItems is 10, so endIndex should be 9
			expect(range.startIndex).toBe(0);
			expect(range.endIndex).toBe(9);
		});

		it("should handle empty list", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 0,
				overscan: 0,
			});
			
			const range = scroller.getVisibleRange(0);
			
			expect(range.startIndex).toBe(0);
			expect(range.endIndex).toBe(-1);
		});
	});

	describe("getTotalHeight", () => {
		it("should calculate total scrollable height", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});
			
			// 100 items * 40px = 4000px
			expect(scroller.getTotalHeight()).toBe(4000);
		});

		it("should return 0 for empty list", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 0,
			});
			
			expect(scroller.getTotalHeight()).toBe(0);
		});
	});

	describe("getItemOffset", () => {
		it("should calculate item offset at index 0", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});
			
			expect(scroller.getItemOffset(0)).toBe(0);
		});

		it("should calculate item offset at index 5", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});
			
			// 5 * 40 = 200
			expect(scroller.getItemOffset(5)).toBe(200);
		});
	});

	describe("updateConfig", () => {
		it("should update totalItems", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});

			scroller.updateConfig({ totalItems: 200 });

			expect(scroller.getConfig().totalItems).toBe(200);
		});

		it("should update containerHeight", () => {
			const scroller = new VirtualScroller({
				itemHeight: 40,
				containerHeight: 400,
				totalItems: 100,
			});

			scroller.updateConfig({ containerHeight: 600 });

			expect(scroller.getConfig().containerHeight).toBe(600);
		});
	});
});

describe("calculateVisibleRange", () => {
	it("should calculate range from scroll position at top", () => {
		const range = calculateVisibleRange({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// 400 / 40 = 10 visible items
		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(9);
		expect(range.visibleCount).toBe(10);
	});

	it("should calculate range from scroll position in middle", () => {
		const range = calculateVisibleRange({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// scrollTop 400 / itemHeight 40 = index 10
		expect(range.startIndex).toBe(10);
		expect(range.endIndex).toBe(19);
		expect(range.visibleCount).toBe(10);
	});

	it("should handle scroll position at end of list", () => {
		const range = calculateVisibleRange({
			scrollTop: 3800, // Near end: 3800/40 = 95
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// Start at index 95, but only 5 items remain (95-99)
		expect(range.startIndex).toBe(95);
		expect(range.endIndex).toBe(99);
		expect(range.visibleCount).toBe(5);
	});

	it("should handle partial scroll position (not aligned to item)", () => {
		const range = calculateVisibleRange({
			scrollTop: 50, // Partial: 50/40 = 1.25
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// Floor(50/40) = 1, visible from index 1
		expect(range.startIndex).toBe(1);
		// Ceil(400/40) = 10, so 10+1 = 11 items might be visible
		expect(range.endIndex).toBe(11);
	});

	it("should handle negative scroll position (clamp to 0)", () => {
		const range = calculateVisibleRange({
			scrollTop: -100,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(9);
	});

	it("should handle scroll position beyond list end", () => {
		const range = calculateVisibleRange({
			scrollTop: 5000, // Beyond end
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// Should clamp to last possible visible items
		expect(range.startIndex).toBeLessThanOrEqual(99);
		expect(range.endIndex).toBe(99);
	});

	it("should handle single item list", () => {
		const range = calculateVisibleRange({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 1,
		});

		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(0);
		expect(range.visibleCount).toBe(1);
	});

	it("should handle empty list", () => {
		const range = calculateVisibleRange({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 0,
		});

		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(-1);
		expect(range.visibleCount).toBe(0);
	});

	it("should handle very small container (fewer items than itemHeight)", () => {
		const range = calculateVisibleRange({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 30, // Less than one item
			totalItems: 100,
		});

		// At least 1 item should be visible
		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(0);
		expect(range.visibleCount).toBe(1);
	});

	it("should calculate correct offset for start position", () => {
		const range = calculateVisibleRange({
			scrollTop: 200,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
		});

		// startIndex is 5, offset should be 5 * 40 = 200
		expect(range.offsetTop).toBe(200);
	});
});

describe("calculateVisibleRangeWithOverscan", () => {
	it("should add overscan items before and after visible range", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 3,
		});

		// Without overscan: startIndex=10, endIndex=19
		// With overscan=3: startIndex=7, endIndex=22
		expect(range.startIndex).toBe(7);
		expect(range.endIndex).toBe(22);
	});

	it("should clamp overscan at start of list", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 3,
		});

		// Without overscan: startIndex=0, endIndex=9
		// With overscan: startIndex=0 (can't go negative), endIndex=12
		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(12);
	});

	it("should clamp overscan at end of list", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 3800, // Start at index 95
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 3,
		});

		// Without overscan: startIndex=95, endIndex=99
		// With overscan: startIndex=92, endIndex=99 (can't go beyond 99)
		expect(range.startIndex).toBe(92);
		expect(range.endIndex).toBe(99);
	});

	it("should handle overscan larger than list", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 5,
			overscan: 10,
		});

		// List only has 5 items, so render all
		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(4);
	});

	it("should handle zero overscan", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 0,
		});

		// Same as without overscan
		expect(range.startIndex).toBe(10);
		expect(range.endIndex).toBe(19);
	});

	it("should handle empty list with overscan", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 0,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 0,
			overscan: 3,
		});

		expect(range.startIndex).toBe(0);
		expect(range.endIndex).toBe(-1);
		expect(range.visibleCount).toBe(0);
	});

	it("should include renderCount for DOM node tracking (AC5)", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 3,
		});

		// renderCount should be endIndex - startIndex + 1
		// 22 - 7 + 1 = 16 items to render
		expect(range.renderCount).toBe(16);
	});

	it("should have renderCount <= 2x visible count for memory efficiency (AC5)", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 1000,
			overscan: 3,
		});

		// 10 visible items + 6 overscan (3 before + 3 after) = 16 rendered
		// This should be <= 2x visible (20)
		expect(range.renderCount).toBeLessThanOrEqual(range.visibleCount * 2);
	});

	it("should calculate correct offsetTop for overscan range", () => {
		const range = calculateVisibleRangeWithOverscan({
			scrollTop: 400,
			itemHeight: 40,
			containerHeight: 400,
			totalItems: 100,
			overscan: 3,
		});

		// startIndex is 7, offset should be 7 * 40 = 280
		expect(range.offsetTop).toBe(280);
	});
});
