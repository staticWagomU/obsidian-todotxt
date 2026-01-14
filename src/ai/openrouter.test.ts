import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "./openrouter";
import type { OpenRouterConfig } from "./openrouter";

describe("OpenRouterService", () => {
	const mockConfig: OpenRouterConfig = {
		apiKey: "test-api-key",
		model: "anthropic/claude-3-haiku",
		retryConfig: {
			enabled: false,
			maxRetries: 3,
			initialDelayMs: 1000,
		},
	};

	beforeEach(() => {
		global.fetch = vi.fn();
	});

	describe("convertToTodotxt", () => {
		it("自然言語をtodo.txt形式に変換する", async () => {
			const mockResponse = {
				choices: [
					{
						message: {
							content: "2026-01-14 田中さんにメールを送る @pc\n2026-01-14 資料を作成 due:2026-01-17",
						},
					},
				],
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt(
				"田中さんにメールを送る #pc\n来週金曜日までに資料を作成",
				"2026-01-14",
				{}
			);

			expect(result.success).toBe(true);
			expect(result.todoLines).toEqual([
				"2026-01-14 田中さんにメールを送る @pc",
				"2026-01-14 資料を作成 due:2026-01-17",
			]);
		});

		it("APIキーとモデルを正しく送信する", async () => {
			const mockResponse = {
				choices: [{ message: { content: "2026-01-14 テストタスク" } }],
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const service = new OpenRouterService(mockConfig);
			await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(global.fetch).toHaveBeenCalledWith(
				"https://openrouter.ai/api/v1/chat/completions",
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						"Authorization": "Bearer test-api-key",
					}),
				})
			);

			const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);
			expect(body.model).toBe("anthropic/claude-3-haiku");
		});

		it("プロンプトが正しく構築される", async () => {
			const mockResponse = {
				choices: [{ message: { content: "2026-01-14 テストタスク" } }],
			};

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			});

			const customContexts = { パソコン: "pc" };
			const service = new OpenRouterService(mockConfig);
			await service.convertToTodotxt("テストタスク", "2026-01-14", customContexts);

			const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.messages).toHaveLength(2);
			expect(body.messages[0].role).toBe("system");
			expect(body.messages[0].content).toContain("2026-01-14");
			expect(body.messages[0].content).toContain("#パソコン → @pc");
			expect(body.messages[1].role).toBe("user");
			expect(body.messages[1].content).toBe("テストタスク");
		});

		it("APIエラー時にエラーメッセージを返す", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(false);
			expect(result.error).toContain("API error");
		});

		it("ネットワークエラー時にエラーメッセージを返す", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Network error")
			);

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(false);
			expect(result.error).toContain("Network error");
		});

		it("無効なレスポンス形式の場合エラーを返す", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: true,
				json: async () => ({}),
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(false);
			expect(result.error).toContain("Invalid response");
		});

		it("リトライ有効時、429エラーでリトライする", async () => {
			const configWithRetry: OpenRouterConfig = {
				...mockConfig,
				retryConfig: {
					enabled: true,
					maxRetries: 2,
					initialDelayMs: 100,
				},
			};

			const mockResponse = {
				choices: [{ message: { content: "2026-01-14 テストタスク" } }],
			};

			(global.fetch as ReturnType<typeof vi.fn>)
				.mockRejectedValueOnce({ status: 429, message: "Rate limit" })
				.mockResolvedValue({
					ok: true,
					json: async () => mockResponse,
				});

			const service = new OpenRouterService(configWithRetry);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(true);
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});
});
