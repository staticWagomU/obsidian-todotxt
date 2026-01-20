import { describe, it, expect, vi } from "vitest";
import { COMMANDS } from "./commands";

// Mock Obsidian module
vi.mock("obsidian", () => ({
	Plugin: class {},
}));

describe("keyboard shortcut commands", () => {
	describe("command definitions", () => {
		it("should have stable command IDs for new task command", () => {
			expect(COMMANDS.newTask.id).toBe("todotxt-new-task");
			expect(COMMANDS.newTask.name).toBe("新規タスク作成");
		});

		it("should have stable command IDs for focus search command", () => {
			expect(COMMANDS.focusSearch.id).toBe("todotxt-focus-search");
			expect(COMMANDS.focusSearch.name).toBe("検索にフォーカス");
		});

		it("should have stable command ID for existing side panel command", () => {
			expect(COMMANDS.openSidePanel.id).toBe("open-todotxt-side-panel");
			expect(COMMANDS.openSidePanel.name).toBe("サイドパネルを開く");
		});
	});

	describe("command structure", () => {
		it("all commands should have id and name properties", () => {
			for (const command of Object.values(COMMANDS)) {
				expect(command).toHaveProperty("id");
				expect(command).toHaveProperty("name");
				expect(typeof command.id).toBe("string");
				expect(typeof command.name).toBe("string");
				expect(command.id.length).toBeGreaterThan(0);
				expect(command.name.length).toBeGreaterThan(0);
			}
		});

		it("command IDs should be unique", () => {
			const ids = Object.values(COMMANDS).map(cmd => cmd.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it("command IDs should follow naming convention (lowercase with hyphens)", () => {
			for (const command of Object.values(COMMANDS)) {
				expect(command.id).toMatch(/^[a-z0-9-]+$/);
			}
		});
	});

	describe("shortcut command usage", () => {
		it("newTask command (Ctrl+N) should be available for dialog opening", () => {
			// Verify command exists and has correct properties
			const cmd = COMMANDS.newTask;
			expect(cmd.id).toBe("todotxt-new-task");
			expect(cmd.name).toContain("タスク");
		});

		it("focusSearch command (Ctrl+F) should be available for search focus", () => {
			// Verify command exists and has correct properties
			const cmd = COMMANDS.focusSearch;
			expect(cmd.id).toBe("todotxt-focus-search");
			expect(cmd.name).toContain("検索");
		});
	});

	describe("Daily Notes commands (PBI-068)", () => {
		it("should have command for exporting tasks to daily note", () => {
			expect(COMMANDS.exportToDailyNote).toBeDefined();
			expect(COMMANDS.exportToDailyNote.id).toBe("todotxt-export-to-daily-note");
			expect(COMMANDS.exportToDailyNote.name).toBe("今日のタスクをデイリーノートにエクスポート");
		});

		it("should have command for importing tasks from daily note", () => {
			expect(COMMANDS.importFromDailyNote).toBeDefined();
			expect(COMMANDS.importFromDailyNote.id).toBe("todotxt-import-from-daily-note");
			expect(COMMANDS.importFromDailyNote.name).toBe("デイリーノートからタスクをインポート");
		});
	});
});
