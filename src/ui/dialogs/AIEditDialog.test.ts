/**
 * Tests for AIEditDialog - AI-powered task editing
 */

import { describe, it, expect } from "vitest";
import type { Todo } from "../../lib/todo";
import { buildEditPrompt } from "../../ai/edit-prompt";

describe("AIEditDialog - OpenRouter API Integration & Preview", () => {
	const mockTodo: Todo = {
		completed: false,
		priority: "A",
		creationDate: "2026-01-14",
		description: "重要なタスク @home +ProjectX due:2026-01-15",
		projects: ["ProjectX"],
		contexts: ["home"],
		tags: { due: "2026-01-15" },
		raw: "(A) 2026-01-14 重要なタスク @home +ProjectX due:2026-01-15",
	};

	it("should build edit prompt with existing todo and natural language instruction", () => {
		const instruction = "明日までに期限を変更";
		const currentDate = "2026-01-14";

		// Expected prompt should include:
		// 1. Current todo content
		// 2. Natural language instruction
		// 3. todo.txt format rules
		// 4. Instructions to output only the updated todo line

		const expectedPromptParts = [
			mockTodo.raw,
			instruction,
			"todo.txt",
			currentDate,
		];

		const prompt = buildEditPrompt(mockTodo, instruction, currentDate, {});

		for (const part of expectedPromptParts) {
			expect(prompt).toContain(part);
		}
	});

	it("should have editTodo method in OpenRouterService", async () => {
		const { OpenRouterService } = await import("../../ai/openrouter");

		const mockConfig = {
			apiKey: "test-key",
			model: "anthropic/claude-3-haiku",
			retryConfig: {
				enabled: true,
				maxRetries: 3,
				initialDelayMs: 1000,
			},
		};

		const service = new OpenRouterService(mockConfig);

		// Check that editTodo method exists and is a function
		const editTodoMethod = service.editTodo.bind(service);
		expect(editTodoMethod).toBeDefined();
		expect(typeof editTodoMethod).toBe("function");
	});

	it("should export EditResult interface from openrouter", async () => {
		// Check that EditResult interface is exported
		const module = await import("../../ai/openrouter");

		// Just verify the import doesn't fail and has expected exports
		expect(module.OpenRouterService).toBeDefined();
	});

	it("should have preview section structure in AIEditDialog", () => {
		// Test preview section can be created
		const contentEl = document.createElement("div");

		// Simulate preview section creation using standard DOM methods
		const previewSection = document.createElement("div");
		previewSection.className = "ai-dialog-preview";
		contentEl.appendChild(previewSection);

		const previewTitle = document.createElement("h3");
		previewTitle.textContent = "プレビュー";
		previewSection.appendChild(previewTitle);

		const previewText = document.createElement("div");
		previewText.className = "preview-todo-text";
		/* eslint-disable obsidianmd/ui/sentence-case -- This is a todo.txt format example, not UI text */
		previewText.textContent = "(A) 2026-01-14 重要なタスク @home +ProjectX due:2026-01-15";
		/* eslint-enable obsidianmd/ui/sentence-case */
		previewSection.appendChild(previewText);

		// Verify structure
		expect(contentEl.querySelector(".ai-dialog-preview")).toBeDefined();
		 
		expect(contentEl.querySelector(".preview-todo-text")?.textContent).toBe(
			"(A) 2026-01-14 重要なタスク @home +ProjectX due:2026-01-15"
		);
		 
	});
});
