import { describe, it, expect } from "vitest";
import {
	ShortcutDefinition,
	DEFAULT_SHORTCUTS,
	formatShortcutKey,
} from "./shortcuts";

describe("ShortcutDefinition extended type", () => {
	describe("DEFAULT_SHORTCUTS constant", () => {
		it("should have unique id for each shortcut", () => {
			const ids = DEFAULT_SHORTCUTS.map((s) => s.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it("should have id, key, description, and category for each shortcut", () => {
			for (const shortcut of DEFAULT_SHORTCUTS) {
				expect(shortcut.id).toBeDefined();
				expect(shortcut.id.length).toBeGreaterThan(0);
				expect(shortcut.key).toBeDefined();
				expect(shortcut.description).toBeDefined();
				expect(shortcut.category).toBeDefined();
			}
		});

		it("should have customKey as optional (undefined by default)", () => {
			for (const shortcut of DEFAULT_SHORTCUTS) {
				expect(shortcut.customKey).toBeUndefined();
			}
		});

		it("should include navigation shortcuts", () => {
			const navShortcuts = DEFAULT_SHORTCUTS.filter(
				(s) => s.category === "navigation"
			);
			expect(navShortcuts.length).toBeGreaterThan(0);
			expect(navShortcuts.some((s) => s.id === "nav-up")).toBe(true);
			expect(navShortcuts.some((s) => s.id === "nav-down")).toBe(true);
		});

		it("should include action shortcuts", () => {
			const actionShortcuts = DEFAULT_SHORTCUTS.filter(
				(s) => s.category === "action"
			);
			expect(actionShortcuts.length).toBeGreaterThan(0);
			expect(actionShortcuts.some((s) => s.id === "action-toggle")).toBe(true);
			expect(actionShortcuts.some((s) => s.id === "action-edit")).toBe(true);
			expect(actionShortcuts.some((s) => s.id === "action-delete")).toBe(true);
		});

		it("should include global shortcuts", () => {
			const globalShortcuts = DEFAULT_SHORTCUTS.filter(
				(s) => s.category === "global"
			);
			expect(globalShortcuts.length).toBeGreaterThan(0);
		});
	});

	describe("ShortcutDefinition type with customKey", () => {
		it("should allow creating shortcut with customKey", () => {
			const shortcut: ShortcutDefinition = {
				id: "test-shortcut",
				key: "Enter",
				description: "Test shortcut",
				category: "action",
				customKey: "Space",
			};
			expect(shortcut.customKey).toBe("Space");
		});

		it("should allow creating shortcut without customKey", () => {
			const shortcut: ShortcutDefinition = {
				id: "test-shortcut-2",
				key: "E",
				description: "Edit task",
				category: "action",
			};
			expect(shortcut.customKey).toBeUndefined();
		});
	});
});

describe("formatShortcutKey", () => {
	it("should format ArrowUp as up arrow symbol", () => {
		expect(formatShortcutKey("ArrowUp")).toBe("\u2191");
	});

	it("should format ArrowDown as down arrow symbol", () => {
		expect(formatShortcutKey("ArrowDown")).toBe("\u2193");
	});

	it("should format Delete as Del", () => {
		expect(formatShortcutKey("Delete")).toBe("Del");
	});

	it("should keep other keys unchanged", () => {
		expect(formatShortcutKey("Enter")).toBe("Enter");
		expect(formatShortcutKey("E")).toBe("E");
		expect(formatShortcutKey("Ctrl+N / Cmd+N")).toBe("Ctrl+N / Cmd+N");
	});
});
