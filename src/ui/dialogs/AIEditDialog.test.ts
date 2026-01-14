/**
 * Tests for AIEditDialog - AI-powered task editing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { App } from "obsidian";
import type { Todo } from "../../lib/todo";

describe("AIEditDialog - OpenRouter API Integration & Preview", () => {
	let mockApp: App;
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

	beforeEach(() => {
		mockApp = {
			vault: {
				getAbstractFileByPath: vi.fn(),
			},
		} as unknown as App;
	});

	it("should build edit prompt with existing todo and natural language instruction", () => {
		// RED: Test that buildEditPrompt creates a proper prompt
		// This will test the prompt building logic for AI editing
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
		
		// This import will fail until we implement it
		const { buildEditPrompt } = require("../../ai/edit-prompt");
		const prompt = buildEditPrompt(mockTodo, instruction, currentDate, {});
		
		for (const part of expectedPromptParts) {
			expect(prompt).toContain(part);
		}
	});

	it("should call OpenRouter API with edit prompt and return updated todo line", async () => {
		// RED: Test that OpenRouterService.editTodo exists and works
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
		
		// Mock requestUrl to return a successful response
		const mockRequestUrl = vi.fn().mockResolvedValue({
			status: 200,
			json: {
				choices: [{
					message: {
						content: "(A) 2026-01-14 重要なタスク @home +ProjectX due:2026-01-15",
					},
				}],
			},
		});
		
		// Replace requestUrl with mock
		vi.mock("obsidian", async () => {
			const actual = await vi.importActual("obsidian");
			return {
				...actual,
				requestUrl: mockRequestUrl,
			};
		});
		
		const instruction = "期限を明日に変更";
		const currentDate = "2026-01-14";
		
		// This method doesn't exist yet - will fail
		const result = await service.editTodo(
			mockTodo,
			instruction,
			currentDate,
			{}
		);
		
		expect(result.success).toBe(true);
		expect(result.updatedTodoLine).toBeDefined();
		expect(result.updatedTodoLine).toContain("due:");
	});

	it("should display preview of updated todo in dialog", () => {
		// RED: Test that AIEditDialog shows preview section
		// This will be a DOM-based test
		
		const updatedTodoLine = "(A) 2026-01-14 重要なタスク @home +ProjectX due:2026-01-15";
		
		// Mock DOM structure
		const contentEl = document.createElement("div");
		
		// Expected: Dialog should have a preview section showing the updated todo
		// This tests the UI rendering logic
		
		// We'll need to check:
		// 1. Preview section exists
		// 2. It shows the updated todo line
		// 3. It's marked as a preview (not editable yet)
		
		const previewSection = contentEl.querySelector(".ai-dialog-preview");
		expect(previewSection).toBeDefined();
		
		const previewText = contentEl.querySelector(".preview-todo-text");
		expect(previewText?.textContent).toBe(updatedTodoLine);
	});

	it("should handle API errors gracefully with error message display", async () => {
		// RED: Test error handling in AI edit flow
		const { OpenRouterService } = await import("../../ai/openrouter");
		
		const mockConfig = {
			apiKey: "invalid-key",
			model: "anthropic/claude-3-haiku",
			retryConfig: {
				enabled: false,
				maxRetries: 0,
				initialDelayMs: 1000,
			},
		};
		
		const service = new OpenRouterService(mockConfig);
		
		// Mock requestUrl to return error
		vi.mock("obsidian", async () => {
			const actual = await vi.importActual("obsidian");
			return {
				...actual,
				requestUrl: vi.fn().mockRejectedValue(new Error("API Error: 401 Unauthorized")),
			};
		});
		
		const result = await service.editTodo(
			mockTodo,
			"期限を明日に変更",
			"2026-01-14",
			{}
		);
		
		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.error).toContain("401");
	});
});
