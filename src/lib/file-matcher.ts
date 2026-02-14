/**
 * Determines whether a file should be opened with the todo.txt view
 * @param filePath - The path of the file to check
 * @param specifiedPaths - Array of paths specified in settings
 * @returns true if the file should be opened as todo.txt, false otherwise
 */
export function shouldOpenAsTodotxt(
	filePath: string,
	specifiedPaths: string[],
): boolean {
	// If paths are specified, check if file matches
	if (specifiedPaths.length > 0) {
		return specifiedPaths.includes(filePath);
	}

	// If no paths specified, use default extension check
	return filePath.endsWith(".txt") || filePath.endsWith(".todotxt");
}

/**
 * Determines whether a file-open event should trigger a view switch to todotxt view.
 * Only .md files need this dynamic switching; .txt/.todotxt are handled by registerExtensions.
 * @param filePath - The path of the opened file
 * @param extension - The file extension (without dot)
 * @param specifiedPaths - Array of paths specified in settings (todotxtFilePaths)
 * @returns true if the view should be switched to todotxt view
 */
export function shouldSwitchToTodotxtView(
	filePath: string,
	extension: string,
	specifiedPaths: string[],
): boolean {
	if (extension !== "md") {
		return false;
	}
	return specifiedPaths.includes(filePath);
}
