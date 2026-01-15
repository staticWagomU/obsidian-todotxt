import type { Todo } from "./todo";

/**
 * Check if a value is null or undefined
 */
function isNullOrUndefined(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Check if a todo matches a simple term (in description, projects, or contexts)
 * Case-insensitive matching
 */
function matchesTerm(todo: Todo, term: string): boolean {
	const lowerTerm = term.toLowerCase();
	return (
		todo.description.toLowerCase().includes(lowerTerm) ||
		todo.projects.some(project => project.toLowerCase().includes(lowerTerm)) ||
		todo.contexts.some(context => context.toLowerCase().includes(lowerTerm))
	);
}

/**
 * Parse search token that may contain OR operators (|)
 * Returns true if any of the OR terms match
 */
function matchesOrGroup(todo: Todo, token: string): boolean {
	const orTerms = token.split("|").filter(t => t.length > 0);
	if (orTerms.length === 0) return true;
	return orTerms.some(term => matchesTerm(todo, term));
}

/**
 * Parse advanced search query into tokens
 * Handles AND (space), OR (|), and NOT (-prefix)
 */
interface ParsedQuery {
	andTerms: string[];  // Terms that must match (may contain OR groups)
	notTerms: string[];  // Terms that must NOT match
}

function parseAdvancedQuery(query: string): ParsedQuery {
	const trimmed = query.trim();
	if (trimmed === "") {
		return { andTerms: [], notTerms: [] };
	}

	const tokens = trimmed.split(/\s+/);
	const andTerms: string[] = [];
	const notTerms: string[] = [];

	for (const token of tokens) {
		if (token.startsWith("-") && token.length > 1) {
			notTerms.push(token.slice(1));
		} else if (token.length > 0) {
			andTerms.push(token);
		}
	}

	return { andTerms, notTerms };
}

/**
 * Filter todos by priority (immutable)
 * Returns a new array containing only tasks that match the specified priority
 * The original array is not modified
 *
 * Edge cases handled:
 * - Empty array returns empty array
 * - No matches returns empty array
 * - Multiple matching tasks preserves original order
 * - Both completed and incomplete tasks are filtered
 *
 * @param todos - Array of todos to filter
 * @param priority - Priority value to filter by (A-Z, null, or undefined for no priority)
 * @returns New filtered array of todos matching the priority
 */
export function filterByPriority(todos: Todo[], priority: string | null | undefined): Todo[] {
	// Handle null/undefined priority - treat them as equivalent
	if (isNullOrUndefined(priority)) {
		return todos.filter(todo => isNullOrUndefined(todo.priority));
	}
	return todos.filter(todo => todo.priority === priority);
}

/**
 * Filter todos by search keyword in description, projects, or contexts (immutable)
 * Returns a new array containing only tasks that match the search keyword
 * The search is case-insensitive
 * The original array is not modified
 *
 * Edge cases:
 * - Empty string returns all tasks (no filtering)
 *
 * @param todos - Array of todos to filter
 * @param keyword - Search keyword to find in description, projects, or contexts
 * @returns New filtered array of todos matching the search keyword
 */
export function filterBySearch(todos: Todo[], keyword: string): Todo[] {
	// Empty string: return all tasks (no filtering)
	if (keyword === "") {
		return [...todos];
	}

	const lowerKeyword = keyword.toLowerCase();
	return todos.filter(todo =>
		todo.description.toLowerCase().includes(lowerKeyword) ||
		todo.projects.some(project => project.toLowerCase().includes(lowerKeyword)) ||
		todo.contexts.some(context => context.toLowerCase().includes(lowerKeyword))
	);
}

/**
 * Filter todos by advanced search query (immutable)
 * Supports:
 * - AND search: space-separated terms (all must match)
 * - OR search: pipe-separated terms (any must match)
 * - NOT search: hyphen-prefixed terms (must not match)
 *
 * Examples:
 * - "Buy store" - tasks containing both "Buy" AND "store"
 * - "groceries|book" - tasks containing "groceries" OR "book"
 * - "-groceries" - tasks NOT containing "groceries"
 * - "Buy store|online -groceries" - "Buy" AND ("store" OR "online") NOT "groceries"
 *
 * @param todos - Array of todos to filter
 * @param query - Advanced search query string
 * @returns New filtered array of todos matching the query
 */
export function filterByAdvancedSearch(todos: Todo[], query: string): Todo[] {
	const { andTerms, notTerms } = parseAdvancedQuery(query);

	// Empty query returns all todos
	if (andTerms.length === 0 && notTerms.length === 0) {
		return [...todos];
	}

	return todos.filter(todo => {
		// All AND terms (which may contain OR groups) must match
		const andMatch = andTerms.every(term => matchesOrGroup(todo, term));

		// None of the NOT terms should match
		const notMatch = notTerms.every(term => !matchesTerm(todo, term));

		return andMatch && notMatch;
	});
}
