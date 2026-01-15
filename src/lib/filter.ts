import type { Todo } from "./todo";

/**
 * Check if a value is null or undefined
 */
function isNullOrUndefined(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Check if a term is a regex pattern (enclosed in /.../)
 * Handles both /pattern/ and -/pattern/ (NOT regex)
 */
function isRegexPattern(term: string): boolean {
	const pattern = term.startsWith("-") ? term.slice(1) : term;
	return pattern.startsWith("/") && pattern.endsWith("/") && pattern.length > 2;
}

/**
 * Parse a regex pattern from /pattern/ format
 * Handles both /pattern/ and -/pattern/ (NOT regex - extracts just the pattern)
 * Returns null if invalid regex
 */
function parseRegexPattern(term: string): RegExp | null {
	// Remove NOT prefix if present
	const regexPart = term.startsWith("-") ? term.slice(1) : term;
	if (!isRegexPattern(regexPart)) return null;

	const pattern = regexPart.slice(1, -1);
	try {
		return new RegExp(pattern, "i"); // case-insensitive by default
	} catch {
		return null;
	}
}

/**
 * Check if a todo matches a regex pattern
 */
function matchesRegex(todo: Todo, regex: RegExp): boolean {
	return (
		regex.test(todo.description) ||
		todo.projects.some(project => regex.test(project)) ||
		todo.contexts.some(context => regex.test(context))
	);
}

/**
 * Special syntax patterns for advanced search
 */
type SpecialSyntax = {
	type: "project" | "context" | "priority" | "due";
	value: string;
	startDate?: string;  // For date range: due:2026-01-01..2026-01-31
	endDate?: string;
};

/**
 * Parse special syntax from a term (e.g., "project:work", "context:home", "due:2026-01-01..2026-01-31")
 * Returns null if not a special syntax term
 */
function parseSpecialSyntax(term: string): SpecialSyntax | null {
	const colonIndex = term.indexOf(":");
	if (colonIndex === -1) return null;

	const prefix = term.slice(0, colonIndex).toLowerCase();
	const value = term.slice(colonIndex + 1);

	if (value === "") return null;

	if (prefix === "project" || prefix === "context" || prefix === "priority" || prefix === "due") {
		// Check for date range syntax (due:YYYY-MM-DD..YYYY-MM-DD)
		if (prefix === "due" && value.includes("..")) {
			const [startDate, endDate] = value.split("..");
			if (startDate && endDate) {
				return { type: "due", value, startDate, endDate };
			}
		}
		return { type: prefix, value };
	}

	return null;
}

/**
 * Check if a date is within a range (inclusive)
 */
function isDateInRange(date: string, startDate: string, endDate: string): boolean {
	// Simple string comparison works for YYYY-MM-DD format
	return date >= startDate && date <= endDate;
}

/**
 * Check if a todo matches a special syntax filter
 */
function matchesSpecialSyntax(todo: Todo, syntax: SpecialSyntax): boolean {
	const lowerValue = syntax.value.toLowerCase();

	switch (syntax.type) {
		case "project":
			return todo.projects.some(p => p.toLowerCase() === lowerValue);
		case "context":
			return todo.contexts.some(c => c.toLowerCase() === lowerValue);
		case "priority":
			if (lowerValue === "none") {
				return todo.priority === undefined || todo.priority === null;
			}
			return todo.priority?.toLowerCase() === lowerValue;
		case "due":
			// Date range search
			if (syntax.startDate && syntax.endDate) {
				const dueDate = todo.tags.due;
				if (!dueDate) return false;
				return isDateInRange(dueDate, syntax.startDate, syntax.endDate);
			}
			// Exact date match
			return todo.tags.due === syntax.value;
		default:
			return false;
	}
}

/**
 * Check if a todo matches a simple term (in description, projects, or contexts)
 * Supports:
 * - Literal terms (case-insensitive)
 * - Regex patterns (/pattern/)
 * - Special syntax (project:, context:, priority:, due:)
 */
function matchesTerm(todo: Todo, term: string): boolean {
	// Check if it's a regex pattern
	const regex = parseRegexPattern(term);
	if (regex) {
		return matchesRegex(todo, regex);
	}

	// Check if it's special syntax
	const specialSyntax = parseSpecialSyntax(term);
	if (specialSyntax) {
		return matchesSpecialSyntax(todo, specialSyntax);
	}

	// Regular case-insensitive string matching
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

/**
 * Tokenize query string, preserving regex patterns (including spaces within them)
 * and NOT prefixes
 */
function tokenizeQuery(query: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let inRegex = false;
	let prefix = ""; // Store NOT prefix (-) before regex
	let i = 0;

	while (i < query.length) {
		const char = query[i];

		if (char === "/" && !inRegex) {
			// Start of regex pattern
			if (current.trim()) {
				// Check if current ends with - (NOT prefix for regex)
				const trimmed = current.trim();
				if (trimmed === "-") {
					prefix = "-";
				} else if (trimmed.endsWith(" -") || trimmed.endsWith("\t-")) {
					// Push previous tokens except the trailing -
					const withoutMinus = trimmed.slice(0, -1).trim();
					for (const t of withoutMinus.split(/\s+/)) {
						if (t) tokens.push(t);
					}
					prefix = "-";
				} else {
					// Push any accumulated non-regex content as separate tokens
					for (const t of trimmed.split(/\s+/)) {
						if (t) tokens.push(t);
					}
				}
				current = "";
			}
			inRegex = true;
			current = prefix + "/";
			prefix = "";
		} else if (char === "/" && inRegex) {
			// End of regex pattern
			current += "/";
			tokens.push(current);
			current = "";
			inRegex = false;
		} else if (inRegex) {
			// Inside regex - preserve everything including spaces
			current += char;
		} else if (char === " " || char === "\t") {
			// Whitespace outside regex - split token
			if (current.trim()) {
				tokens.push(current.trim());
			}
			current = "";
		} else {
			current += char;
		}
		i++;
	}

	// Handle remaining content
	if (current.trim()) {
		if (inRegex) {
			// Unclosed regex - treat as literal
			for (const t of current.trim().split(/\s+/)) {
				if (t) tokens.push(t);
			}
		} else {
			tokens.push(current.trim());
		}
	}

	return tokens;
}

function parseAdvancedQuery(query: string): ParsedQuery {
	const trimmed = query.trim();
	if (trimmed === "") {
		return { andTerms: [], notTerms: [] };
	}

	const tokens = tokenizeQuery(trimmed);
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
