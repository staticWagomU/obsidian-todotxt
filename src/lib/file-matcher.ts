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
