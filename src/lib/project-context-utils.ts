/**
 * Project/Context selection utilities
 * Helper functions for rendering project and context options
 */

export interface SelectOption {
	value: string;
	label: string;
}

/**
 * Render project options from project names
 * Converts ["project1", "project2"] to [{ value: "project1", label: "+project1" }, ...]
 */
export function renderProjectOptions(projects: string[]): SelectOption[] {
	return projects.map((project) => ({
		value: project,
		label: `+${project}`,
	}));
}

/**
 * Render context options from context names
 * Converts ["home", "work"] to [{ value: "home", label: "@home" }, ...]
 */
export function renderContextOptions(contexts: string[]): SelectOption[] {
	return contexts.map((context) => ({
		value: context,
		label: `@${context}`,
	}));
}
