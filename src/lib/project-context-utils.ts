/**
 * Project/Context selection utilities
 * Helper functions for rendering project and context options
 *
 * @example
 * ```ts
 * import { extractProjects, extractContexts } from "./suggestions";
 * import { renderProjectOptions, renderContextOptions } from "./project-context-utils";
 *
 * const todos: Todo[] = [...];
 * const projects = extractProjects(todos); // ["project1", "project2"]
 * const projectOptions = renderProjectOptions(projects);
 * // [{ value: "project1", label: "+project1" }, { value: "project2", label: "+project2" }]
 *
 * const contexts = extractContexts(todos); // ["home", "work"]
 * const contextOptions = renderContextOptions(contexts);
 * // [{ value: "home", label: "@home" }, { value: "work", label: "@work" }]
 * ```
 */

export interface SelectOption {
	value: string;
	label: string;
}

/**
 * Render project options from project names
 * Adds "+" prefix to each project name for display
 *
 * @param projects - Array of project names (without prefix)
 * @returns Array of select options with value and label (with "+" prefix)
 *
 * @example
 * ```ts
 * renderProjectOptions(["project1", "project2"])
 * // Returns: [{ value: "project1", label: "+project1" }, { value: "project2", label: "+project2" }]
 * ```
 */
export function renderProjectOptions(projects: string[]): SelectOption[] {
	return projects.map((project) => ({
		value: project,
		label: `+${project}`,
	}));
}

/**
 * Render context options from context names
 * Adds "@" prefix to each context name for display
 *
 * @param contexts - Array of context names (without prefix)
 * @returns Array of select options with value and label (with "@" prefix)
 *
 * @example
 * ```ts
 * renderContextOptions(["home", "work"])
 * // Returns: [{ value: "home", label: "@home" }, { value: "work", label: "@work" }]
 * ```
 */
export function renderContextOptions(contexts: string[]): SelectOption[] {
	return contexts.map((context) => ({
		value: context,
		label: `@${context}`,
	}));
}
