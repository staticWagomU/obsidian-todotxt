import { describe, it, expect, vi, beforeEach } from "vitest";
import { KeyboardNavigator, KeyboardActionHandler } from "./keyboard-navigation";

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

describe("keyboard action handler", () => {
	let handler: KeyboardActionHandler;
	let mockOnToggle: ReturnType<typeof vi.fn<(index: number) => void>>;
	let mockOnEdit: ReturnType<typeof vi.fn<(index: number) => void>>;
	let mockOnDelete: ReturnType<typeof vi.fn<(index: number) => void>>;

	beforeEach(() => {
		mockOnToggle = vi.fn<(index: number) => void>();
		mockOnEdit = vi.fn<(index: number) => void>();
		mockOnDelete = vi.fn<(index: number) => void>();
		handler = new KeyboardActionHandler({
			onToggle: mockOnToggle,
			onEdit: mockOnEdit,
			onDelete: mockOnDelete,
		});
	});

	describe("Enter key - toggle completion", () => {
		it("should call onToggle with selected index", () => {
			handler.handleEnter(2);
			expect(mockOnToggle).toHaveBeenCalledWith(2);
		});

		it("should not call onToggle when no selection (-1)", () => {
			handler.handleEnter(-1);
			expect(mockOnToggle).not.toHaveBeenCalled();
		});
	});

	describe("E key - edit task", () => {
		it("should call onEdit with selected index", () => {
			handler.handleEdit(3);
			expect(mockOnEdit).toHaveBeenCalledWith(3);
		});

		it("should not call onEdit when no selection (-1)", () => {
			handler.handleEdit(-1);
			expect(mockOnEdit).not.toHaveBeenCalled();
		});
	});

	describe("Delete key - delete task", () => {
		it("should call onDelete with selected index", () => {
			handler.handleDelete(1);
			expect(mockOnDelete).toHaveBeenCalledWith(1);
		});

		it("should not call onDelete when no selection (-1)", () => {
			handler.handleDelete(-1);
			expect(mockOnDelete).not.toHaveBeenCalled();
		});
	});

	describe("keyboard event handling", () => {
		it("should handle ArrowDown key", () => {
			const result = handler.getActionForKey("ArrowDown");
			expect(result).toBe("moveDown");
		});

		it("should handle ArrowUp key", () => {
			const result = handler.getActionForKey("ArrowUp");
			expect(result).toBe("moveUp");
		});

		it("should handle Enter key", () => {
			const result = handler.getActionForKey("Enter");
			expect(result).toBe("toggle");
		});

		it("should handle e key (lowercase)", () => {
			const result = handler.getActionForKey("e");
			expect(result).toBe("edit");
		});

		it("should handle E key (uppercase)", () => {
			const result = handler.getActionForKey("E");
			expect(result).toBe("edit");
		});

		it("should handle Delete key", () => {
			const result = handler.getActionForKey("Delete");
			expect(result).toBe("delete");
		});

		it("should handle Backspace key", () => {
			const result = handler.getActionForKey("Backspace");
			expect(result).toBe("delete");
		});

		it("should return null for unhandled keys", () => {
			const result = handler.getActionForKey("a");
			expect(result).toBeNull();
		});
	});

	describe("Undo/Redo keyboard shortcuts (AC1, AC2)", () => {
		it("should detect Ctrl+Z as undo", () => {
			const result = handler.getActionForModifiedKey("z", { ctrlKey: true, metaKey: false, shiftKey: false });
			expect(result).toBe("undo");
		});

		it("should detect Cmd+Z as undo on Mac", () => {
			const result = handler.getActionForModifiedKey("z", { ctrlKey: false, metaKey: true, shiftKey: false });
			expect(result).toBe("undo");
		});

		it("should detect Ctrl+Shift+Z as redo", () => {
			const result = handler.getActionForModifiedKey("z", { ctrlKey: true, metaKey: false, shiftKey: true });
			expect(result).toBe("redo");
		});

		it("should detect Cmd+Shift+Z as redo on Mac", () => {
			const result = handler.getActionForModifiedKey("z", { ctrlKey: false, metaKey: true, shiftKey: true });
			expect(result).toBe("redo");
		});

		it("should detect Ctrl+Y as redo (Windows)", () => {
			const result = handler.getActionForModifiedKey("y", { ctrlKey: true, metaKey: false, shiftKey: false });
			expect(result).toBe("redo");
		});

		it("should return null for Z without modifier", () => {
			const result = handler.getActionForModifiedKey("z", { ctrlKey: false, metaKey: false, shiftKey: false });
			expect(result).toBeNull();
		});
	});
});
