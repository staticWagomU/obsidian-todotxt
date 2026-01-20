import { buildSystemPrompt } from "./prompt";
import { buildEditPrompt } from "./edit-prompt";
import { buildDecomposePrompt, parseDecomposeResponse } from "./decompose-prompt";
import { withRetry, type RetryConfig } from "./retry";
import { requestUrl } from "obsidian";
import type { Todo } from "../lib/todo";

export interface OpenRouterConfig {
	apiKey: string;
	model: string;
	retryConfig: RetryConfig;
}

export interface ConversionResult {
	success: boolean;
	todoLines?: string[];
	error?: string;
}

export interface EditResult {
	success: boolean;
	updatedTodoLine?: string;
	error?: string;
}

export interface BulkEditResult {
	success: boolean;
	updatedTodoLines?: string[];
	error?: string;
}

export interface DecomposeResult {
	success: boolean;
	subtaskLines?: string[];
	error?: string;
}

interface OpenRouterResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
}

class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export class OpenRouterService {
	private config: OpenRouterConfig;

	constructor(config: OpenRouterConfig) {
		this.config = config;
	}

	async convertToTodotxt(
		naturalLanguage: string,
		currentDate: string,
		customContexts: Record<string, string>,
	): Promise<ConversionResult> {
		try {
			const systemPrompt = buildSystemPrompt(currentDate, customContexts);

			const apiCall = async () => {
				const response = await requestUrl({
					url: "https://openrouter.ai/api/v1/chat/completions",
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.config.apiKey}`,
						"HTTP-Referer": "obsidian://todotxt",
						"X-Title": "Obsidian Todo.txt Plugin",
					},
					body: JSON.stringify({
						model: this.config.model,
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: naturalLanguage },
						],
					}),
				});

				if (response.status >= 400) {
					throw new ApiError(
						response.status,
						this.getHttpErrorMessage(response.status),
					);
				}

				return response;
			};

			const response = await withRetry(apiCall, this.config.retryConfig);
			const data = response.json as OpenRouterResponse;

			if (!data.choices?.[0]?.message?.content) {
				return {
					success: false,
					error: "Invalid response format from API",
				};
			}

			const content = data.choices[0].message.content;
			const todoLines = content
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			return {
				success: true,
				todoLines,
			};
		} catch (error) {
			return {
				success: false,
				error: this.formatErrorMessage(error),
			};
		}
	}

	async editTodo(
		todo: Todo,
		instruction: string,
		currentDate: string,
		customContexts: Record<string, string>,
	): Promise<EditResult> {
		try {
			const systemPrompt = buildEditPrompt(todo, instruction, currentDate, customContexts);

			const apiCall = async () => {
				const response = await requestUrl({
					url: "https://openrouter.ai/api/v1/chat/completions",
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.config.apiKey}`,
						"HTTP-Referer": "obsidian://todotxt",
						"X-Title": "Obsidian Todo.txt Plugin",
					},
					body: JSON.stringify({
						model: this.config.model,
						messages: [
							{ role: "user", content: systemPrompt },
						],
					}),
				});

				if (response.status >= 400) {
					throw new ApiError(
						response.status,
						this.getHttpErrorMessage(response.status),
					);
				}

				return response;
			};

			const response = await withRetry(apiCall, this.config.retryConfig);
			const data = response.json as OpenRouterResponse;

			if (!data.choices?.[0]?.message?.content) {
				return {
					success: false,
					error: "Invalid response format from API",
				};
			}

			const content = data.choices[0].message.content.trim();

			return {
				success: true,
				updatedTodoLine: content,
			};
		} catch (error) {
			return {
				success: false,
				error: this.formatErrorMessage(error),
			};
		}
	}

	async bulkEditTodos(
		todos: Todo[],
		instruction: string,
		currentDate: string,
		customContexts: Record<string, string>,
	): Promise<BulkEditResult> {
		try {
			const systemPrompt = this.buildBulkEditPrompt(todos, instruction, currentDate, customContexts);

			const apiCall = async () => {
				const response = await requestUrl({
					url: "https://openrouter.ai/api/v1/chat/completions",
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.config.apiKey}`,
						"HTTP-Referer": "obsidian://todotxt",
						"X-Title": "Obsidian Todo.txt Plugin",
					},
					body: JSON.stringify({
						model: this.config.model,
						messages: [
							{ role: "user", content: systemPrompt },
						],
					}),
				});

				if (response.status >= 400) {
					throw new ApiError(
						response.status,
						this.getHttpErrorMessage(response.status),
					);
				}

				return response;
			};

			const response = await withRetry(apiCall, this.config.retryConfig);
			const data = response.json as OpenRouterResponse;

			if (!data.choices?.[0]?.message?.content) {
				return {
					success: false,
					error: "Invalid response format from API",
				};
			}

			const content = data.choices[0].message.content.trim();
			const updatedLines = content
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			// Validate that we got the same number of lines as input todos
			if (updatedLines.length !== todos.length) {
				return {
					success: false,
					error: `Line count mismatch: expected ${todos.length}, got ${updatedLines.length}`,
				};
			}

			return {
				success: true,
				updatedTodoLines: updatedLines,
			};
		} catch (error) {
			return {
				success: false,
				error: this.formatErrorMessage(error),
			};
		}
	}

	/**
	 * Build prompt for bulk editing multiple todos
	 */
	private buildBulkEditPrompt(
		todos: Todo[],
		instruction: string,
		currentDate: string,
		customContexts: Record<string, string>,
	): string {
		const todoList = todos.map((todo, idx) => `${idx + 1}. ${todo.raw}`).join("\n");
		const contextMappings = Object.entries(customContexts)
			.map(([key, value]) => `#${key} → @${value}`)
			.join(", ");

		return `You are a todo.txt format expert. Edit the following tasks according to the instruction.

Current date: ${currentDate}
${contextMappings ? `Context mappings: ${contextMappings}` : ""}

## Tasks to edit:
${todoList}

## Instruction:
${instruction}

## Rules:
- Output EXACTLY ${todos.length} lines, one for each input task
- Each line must be a valid todo.txt format task
- Apply the instruction to ALL tasks
- Preserve existing tags/contexts unless explicitly modified
- Output ONLY the edited tasks, no explanations or numbering`;
	}

	/**
	 * Decompose a task into subtasks using AI
	 * PBI-067 AC2, AC5対応
	 */
	async decomposeTask(
		todo: Todo,
		currentDate: string,
		customInstruction?: string,
	): Promise<DecomposeResult> {
		try {
			const prompt = buildDecomposePrompt(
				todo.description || todo.raw,
				currentDate,
				customInstruction,
				todo.projects,
				todo.contexts,
			);

			const apiCall = async () => {
				const response = await requestUrl({
					url: "https://openrouter.ai/api/v1/chat/completions",
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.config.apiKey}`,
						"HTTP-Referer": "obsidian://todotxt",
						"X-Title": "Obsidian Todo.txt Plugin",
					},
					body: JSON.stringify({
						model: this.config.model,
						messages: [
							{ role: "user", content: prompt },
						],
					}),
				});

				if (response.status >= 400) {
					throw new ApiError(
						response.status,
						this.getHttpErrorMessage(response.status),
					);
				}

				return response;
			};

			const response = await withRetry(apiCall, this.config.retryConfig);
			const data = response.json as OpenRouterResponse;

			if (!data.choices?.[0]?.message?.content) {
				return {
					success: false,
					error: "Invalid response format from API",
				};
			}

			const content = data.choices[0].message.content;
			const subtaskLines = parseDecomposeResponse(content);

			return {
				success: true,
				subtaskLines,
			};
		} catch (error) {
			return {
				success: false,
				error: this.formatErrorMessage(error),
			};
		}
	}

	/**
	 * Get human-readable error message based on HTTP status code
	 */
	private getHttpErrorMessage(status: number): string {
		if (status === 401) {
			return "Unauthorized: Invalid API key";
		} else if (status === 429) {
			return "Rate limit exceeded: Too many requests";
		} else if (status >= 500) {
			return `Server error: ${status}`;
		} else if (status >= 400) {
			return `Client error: ${status}`;
		}
		return `API error: ${status}`;
	}

	/**
	 * Format error message from various error types
	 */
	private formatErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		} else if (
			typeof error === "object" &&
			error !== null &&
			"message" in error
		) {
			return String((error as { message: unknown }).message);
		}
		return JSON.stringify(error);
	}
}
