/**
 * Daily Notes Integration
 * Functions for integrating with Obsidian's Daily Notes plugin
 */

import type { App } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";

/**
 * Check if Daily Notes plugin is enabled
 * Wraps appHasDailyNotesPluginLoaded from obsidian-daily-notes-interface
 * @param app - Obsidian App instance
 * @returns true if Daily Notes plugin is loaded
 */
export function isDailyNotesPluginEnabled(app: App): boolean {
	return appHasDailyNotesPluginLoaded(app);
}
