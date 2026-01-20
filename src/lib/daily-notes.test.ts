/**
 * Daily Notes Integration Tests
 * Tests for detecting Daily Notes plugin and core functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isDailyNotesPluginEnabled } from "./daily-notes";

// Mock obsidian-daily-notes-interface
vi.mock("obsidian-daily-notes-interface", () => ({
	appHasDailyNotesPluginLoaded: vi.fn(),
}));

describe("Daily Notes Plugin Detection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("isDailyNotesPluginEnabled", () => {
		it("should return true when Daily Notes plugin is enabled", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(true);

			const mockApp = {} as never;
			const result = isDailyNotesPluginEnabled(mockApp);

			expect(result).toBe(true);
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledWith(mockApp);
		});

		it("should return false when Daily Notes plugin is not enabled", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(false);

			const mockApp = {} as never;
			const result = isDailyNotesPluginEnabled(mockApp);

			expect(result).toBe(false);
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledWith(mockApp);
		});

		it("should wrap the external library function", async () => {
			const { appHasDailyNotesPluginLoaded } = await import("obsidian-daily-notes-interface");
			vi.mocked(appHasDailyNotesPluginLoaded).mockReturnValue(true);

			const mockApp = { vault: {} } as never;
			isDailyNotesPluginEnabled(mockApp);

			// Verify the wrapper function passes the app correctly
			expect(appHasDailyNotesPluginLoaded).toHaveBeenCalledTimes(1);
		});
	});
});
