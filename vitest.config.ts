import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		include: ["src/**/*.test.ts"],
		alias: {
			obsidian: new URL("./test/mocks/obsidian.ts", import.meta.url).pathname,
		},
	},
});
