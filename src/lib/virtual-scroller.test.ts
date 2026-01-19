import { describe, it, expect } from "vitest";
import { VirtualScroller, type VirtualScrollerConfig } from "./virtual-scroller";

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
