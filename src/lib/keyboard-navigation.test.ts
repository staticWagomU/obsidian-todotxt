import { describe, it, expect, beforeEach } from "vitest";
import { KeyboardNavigator } from "./keyboard-navigation";

describe("keyboard navigation", () => {
	let navigator: KeyboardNavigator;

	beforeEach(() => {
		navigator = new KeyboardNavigator(5); // 5 tasks
	});

	describe("initial state", () => {
		it("should have no selection by default", () => {
			expect(navigator.getSelectedIndex()).toBe(-1);
		});

		it("should have correct total count", () => {
			expect(navigator.getTotalCount()).toBe(5);
		});
	});

	describe("arrow down navigation", () => {
		it("should select first item when pressing down with no selection", () => {
			navigator.moveDown();
			expect(navigator.getSelectedIndex()).toBe(0);
		});

		it("should move to next item when pressing down", () => {
			navigator.setSelectedIndex(0);
			navigator.moveDown();
			expect(navigator.getSelectedIndex()).toBe(1);
		});

		it("should not go past last item", () => {
			navigator.setSelectedIndex(4);
			navigator.moveDown();
			expect(navigator.getSelectedIndex()).toBe(4);
		});
	});

	describe("arrow up navigation", () => {
		it("should select last item when pressing up with no selection", () => {
			navigator.moveUp();
			expect(navigator.getSelectedIndex()).toBe(4);
		});

		it("should move to previous item when pressing up", () => {
			navigator.setSelectedIndex(2);
			navigator.moveUp();
			expect(navigator.getSelectedIndex()).toBe(1);
		});

		it("should not go before first item", () => {
			navigator.setSelectedIndex(0);
			navigator.moveUp();
			expect(navigator.getSelectedIndex()).toBe(0);
		});
	});

	describe("selection management", () => {
		it("should allow setting selection directly", () => {
			navigator.setSelectedIndex(3);
			expect(navigator.getSelectedIndex()).toBe(3);
		});

		it("should clamp negative index to -1", () => {
			navigator.setSelectedIndex(-5);
			expect(navigator.getSelectedIndex()).toBe(-1);
		});

		it("should clamp index beyond max to last item", () => {
			navigator.setSelectedIndex(10);
			expect(navigator.getSelectedIndex()).toBe(4);
		});

		it("should clear selection", () => {
			navigator.setSelectedIndex(2);
			navigator.clearSelection();
			expect(navigator.getSelectedIndex()).toBe(-1);
		});
	});

	describe("update total count", () => {
		it("should update total count", () => {
			navigator.setTotalCount(10);
			expect(navigator.getTotalCount()).toBe(10);
		});

		it("should clamp selection when total count decreases", () => {
			navigator.setSelectedIndex(4);
			navigator.setTotalCount(3);
			expect(navigator.getSelectedIndex()).toBe(2);
		});

		it("should clear selection when total count becomes 0", () => {
			navigator.setSelectedIndex(2);
			navigator.setTotalCount(0);
			expect(navigator.getSelectedIndex()).toBe(-1);
		});
	});
});
