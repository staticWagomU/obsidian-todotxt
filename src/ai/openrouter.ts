import { buildSystemPrompt } from "./prompt";
import { buildEditPrompt } from "./edit-prompt";
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
