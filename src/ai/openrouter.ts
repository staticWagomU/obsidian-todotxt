import { buildSystemPrompt } from "./prompt";
import { withRetry, type RetryConfig } from "./retry";
import { requestUrl } from "obsidian";

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
						`API error: ${response.status}`,
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
			let errorMessage: string;
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (
				typeof error === "object" &&
				error !== null &&
				"message" in error
			) {
				errorMessage = String((error as { message: unknown }).message);
			} else {
				errorMessage = JSON.stringify(error);
			}

			return {
				success: false,
				error: errorMessage,
			};
		}
	}
}
