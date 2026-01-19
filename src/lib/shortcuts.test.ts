import { describe, it, expect } from "vitest";
import {
	ShortcutDefinition,
	DEFAULT_SHORTCUTS,
	formatShortcutKey,
	detectKeyConflict,
	ShortcutManager,
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

describe("detectKeyConflict", () => {
	describe("no conflict detection", () => {
		it("should return empty array when no conflicts exist", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
				{ id: "shortcut-2", key: "B", description: "Action B", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			const conflicts = detectKeyConflict(shortcuts, customKeys, "C", "shortcut-new");
			expect(conflicts).toEqual([]);
		});

		it("should return empty array when checking same shortcut's current key", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			// shortcut-1 is already using "A", so no conflict when setting it to "A"
			const conflicts = detectKeyConflict(shortcuts, customKeys, "A", "shortcut-1");
			expect(conflicts).toEqual([]);
		});
	});

	describe("conflict with default keys", () => {
		it("should detect conflict with another shortcut's default key", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
				{ id: "shortcut-2", key: "B", description: "Action B", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			// Trying to set shortcut-2 to "A" conflicts with shortcut-1
			const conflicts = detectKeyConflict(shortcuts, customKeys, "A", "shortcut-2");
			expect(conflicts).toEqual(["shortcut-1"]);
		});

		it("should detect multiple conflicts", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
				{ id: "shortcut-2", key: "A", description: "Action B", category: "action" },
				{ id: "shortcut-3", key: "B", description: "Action C", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			// Trying to set shortcut-3 to "A" conflicts with shortcut-1 and shortcut-2
			const conflicts = detectKeyConflict(shortcuts, customKeys, "A", "shortcut-3");
			expect(conflicts).toContain("shortcut-1");
			expect(conflicts).toContain("shortcut-2");
			expect(conflicts.length).toBe(2);
		});
	});

	describe("conflict with custom keys", () => {
		it("should detect conflict with another shortcut's custom key", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
				{ id: "shortcut-2", key: "B", description: "Action B", category: "action" },
			];
			// shortcut-1 has been customized to use "X"
			const customKeys: Record<string, string> = { "shortcut-1": "X" };

			// Trying to set shortcut-2 to "X" conflicts with shortcut-1's custom key
			const conflicts = detectKeyConflict(shortcuts, customKeys, "X", "shortcut-2");
			expect(conflicts).toEqual(["shortcut-1"]);
		});

		it("should not conflict with overridden default key", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "A", description: "Action A", category: "action" },
				{ id: "shortcut-2", key: "B", description: "Action B", category: "action" },
			];
			// shortcut-1's default key "A" is overridden to "X"
			const customKeys: Record<string, string> = { "shortcut-1": "X" };

			// Trying to set shortcut-2 to "A" should not conflict because shortcut-1 no longer uses "A"
			const conflicts = detectKeyConflict(shortcuts, customKeys, "A", "shortcut-2");
			expect(conflicts).toEqual([]);
		});
	});

	describe("case sensitivity", () => {
		it("should treat keys as case-insensitive", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "shortcut-1", key: "E", description: "Edit", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			const conflicts = detectKeyConflict(shortcuts, customKeys, "e", "shortcut-2");
			expect(conflicts).toEqual(["shortcut-1"]);
		});
	});

	describe("warning message generation", () => {
		it("should return conflicting shortcut IDs for warning display", () => {
			const shortcuts: ShortcutDefinition[] = [
				{ id: "action-edit", key: "E", description: "タスクを編集", category: "action" },
				{ id: "action-toggle", key: "Enter", description: "タスクの完了/未完了を切替", category: "action" },
			];
			const customKeys: Record<string, string> = {};

			const conflicts = detectKeyConflict(shortcuts, customKeys, "E", "action-toggle");
			expect(conflicts).toEqual(["action-edit"]);
			// The caller can use these IDs to generate warning messages
		});
	});
});

describe("ShortcutManager", () => {
	describe("initialization", () => {
		it("should initialize with default shortcuts", () => {
			const manager = new ShortcutManager();
			expect(manager.getAllShortcuts()).toEqual(DEFAULT_SHORTCUTS);
		});

		it("should initialize with custom shortcuts from settings", () => {
			const customKeys = { "action-edit": "F2" };
			const manager = new ShortcutManager(customKeys);
			expect(manager.getCustomKey("action-edit")).toBe("F2");
		});
	});

	describe("getCustomKey", () => {
		it("should return custom key when set", () => {
			const customKeys = { "action-edit": "F2" };
			const manager = new ShortcutManager(customKeys);
			expect(manager.getCustomKey("action-edit")).toBe("F2");
		});

		it("should return undefined when no custom key is set", () => {
			const manager = new ShortcutManager();
			expect(manager.getCustomKey("action-edit")).toBeUndefined();
		});
	});

	describe("getEffectiveKey", () => {
		it("should return custom key when set", () => {
			const customKeys = { "action-edit": "F2" };
			const manager = new ShortcutManager(customKeys);
			expect(manager.getEffectiveKey("action-edit")).toBe("F2");
		});

		it("should return default key when no custom key is set", () => {
			const manager = new ShortcutManager();
			expect(manager.getEffectiveKey("action-edit")).toBe("E");
		});

		it("should return undefined for unknown shortcut id", () => {
			const manager = new ShortcutManager();
			expect(manager.getEffectiveKey("unknown-id")).toBeUndefined();
		});
	});

	describe("setCustomKey", () => {
		it("should set custom key for a shortcut", () => {
			const manager = new ShortcutManager();
			const result = manager.setCustomKey("action-edit", "F2");

			expect(result.success).toBe(true);
			expect(manager.getCustomKey("action-edit")).toBe("F2");
		});

		it("should detect conflict when setting duplicate key", () => {
			const manager = new ShortcutManager();
			// action-toggle uses "Enter" by default
			const result = manager.setCustomKey("action-edit", "Enter");

			expect(result.success).toBe(false);
			expect(result.conflicts).toContain("action-toggle");
		});

		it("should return success when no conflict", () => {
			const manager = new ShortcutManager();
			const result = manager.setCustomKey("action-edit", "F2");

			expect(result.success).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it("should return failure for unknown shortcut id", () => {
			const manager = new ShortcutManager();
			const result = manager.setCustomKey("unknown-id", "F2");

			expect(result.success).toBe(false);
		});
	});

	describe("removeCustomKey", () => {
		it("should remove custom key and revert to default", () => {
			const customKeys = { "action-edit": "F2" };
			const manager = new ShortcutManager(customKeys);

			manager.removeCustomKey("action-edit");

			expect(manager.getCustomKey("action-edit")).toBeUndefined();
			expect(manager.getEffectiveKey("action-edit")).toBe("E");
		});

		it("should do nothing for non-existent custom key", () => {
			const manager = new ShortcutManager();
			// Should not throw
			expect(() => manager.removeCustomKey("action-edit")).not.toThrow();
		});
	});

	describe("getCustomKeys", () => {
		it("should return all custom keys", () => {
			const customKeys = { "action-edit": "F2", "action-toggle": "Space" };
			const manager = new ShortcutManager(customKeys);

			expect(manager.getCustomKeys()).toEqual(customKeys);
		});

		it("should return empty object when no custom keys", () => {
			const manager = new ShortcutManager();
			expect(manager.getCustomKeys()).toEqual({});
		});

		it("should return a copy, not reference", () => {
			const customKeys = { "action-edit": "F2" };
			const manager = new ShortcutManager(customKeys);

			const retrieved = manager.getCustomKeys();
			retrieved["action-toggle"] = "Space";

			expect(manager.getCustomKeys()).toEqual({ "action-edit": "F2" });
		});
	});

	describe("getShortcutById", () => {
		it("should return shortcut definition by id", () => {
			const manager = new ShortcutManager();
			const shortcut = manager.getShortcutById("action-edit");

			expect(shortcut).toBeDefined();
			expect(shortcut?.id).toBe("action-edit");
			expect(shortcut?.key).toBe("E");
		});

		it("should return undefined for unknown id", () => {
			const manager = new ShortcutManager();
			expect(manager.getShortcutById("unknown-id")).toBeUndefined();
		});
	});
});
