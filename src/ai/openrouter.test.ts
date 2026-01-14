/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "./openrouter";
import type { OpenRouterConfig } from "./openrouter";

// Mock Obsidian's requestUrl
vi.mock("obsidian", () => ({
	requestUrl: vi.fn(),
}));

import { requestUrl } from "obsidian";

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
		vi.clearAllMocks();
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

			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: mockResponse,
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
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

			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: mockResponse,
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const service = new OpenRouterService(mockConfig);
			await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(requestUrl).toHaveBeenCalledWith(
				expect.objectContaining({
					url: "https://openrouter.ai/api/v1/chat/completions",
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						"Authorization": "Bearer test-api-key",
					}),
				})
			);

			const callArgs = vi.mocked(requestUrl).mock.calls[0]?.[0];
			if (typeof callArgs === "string" || !callArgs?.body) return;
			const body = JSON.parse(callArgs.body as string) as { model: string };
			expect(body.model).toBe("anthropic/claude-3-haiku");
		});

		it("プロンプトが正しく構築される", async () => {
			const mockResponse = {
				choices: [{ message: { content: "2026-01-14 テストタスク" } }],
			};

			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: mockResponse,
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const customContexts = { パソコン: "pc" };
			const service = new OpenRouterService(mockConfig);
			await service.convertToTodotxt("テストタスク", "2026-01-14", customContexts);

			const callArgs = vi.mocked(requestUrl).mock.calls[0]?.[0];
			if (typeof callArgs === "string" || !callArgs?.body) return;
			const body = JSON.parse(callArgs.body as string) as {
				messages: Array<{ role: string; content: string }>;
			};

			expect(body.messages).toHaveLength(2);
			expect(body.messages[0]?.role).toBe("system");
			expect(body.messages[0]?.content).toContain("2026-01-14");
			expect(body.messages[0]?.content).toContain("#パソコン → @pc");
			expect(body.messages[1]?.role).toBe("user");
			expect(body.messages[1]?.content).toBe("テストタスク");
		});

		it("APIエラー時にエラーメッセージを返す", async () => {
			vi.mocked(requestUrl).mockResolvedValue({
				status: 401,
				json: {},
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(false);
			expect(result.error).toContain("Unauthorized");
		});

		it("ネットワークエラー時にエラーメッセージを返す", async () => {
			vi.mocked(requestUrl).mockRejectedValue(
				new Error("Network error")
			);

			const service = new OpenRouterService(mockConfig);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(false);
			expect(result.error).toContain("Network error");
		});

		it("無効なレスポンス形式の場合エラーを返す", async () => {
			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: {},
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
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

			vi.mocked(requestUrl)
				.mockRejectedValueOnce({ status: 429, message: "Rate limit" })
				.mockResolvedValue({
					status: 200,
					json: mockResponse,
					headers: {},
					arrayBuffer: new ArrayBuffer(0),
					text: "",
				});

			const service = new OpenRouterService(configWithRetry);
			const result = await service.convertToTodotxt("テストタスク", "2026-01-14", {});

			expect(result.success).toBe(true);
			expect(requestUrl).toHaveBeenCalledTimes(2);
		});
	});

	describe("bulkEditTodos", () => {
		it("複数タスクを自然言語指示で一括編集する", async () => {
			const todos = [
				{ raw: "タスク1", description: "タスク1", completed: false, priority: undefined, projects: [], contexts: [], tags: {}, creationDate: undefined, completionDate: undefined },
				{ raw: "タスク2", description: "タスク2", completed: false, priority: undefined, projects: [], contexts: [], tags: {}, creationDate: undefined, completionDate: undefined },
			];

			const mockResponse = {
				choices: [
					{
						message: {
							content: "(A) タスク1\n(A) タスク2",
						},
					},
				],
			};

			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: mockResponse,
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.bulkEditTodos(
				todos,
				"すべてのタスクに優先度Aを設定",
				"2026-01-15",
				{}
			);

			expect(result.success).toBe(true);
			expect(result.updatedTodoLines).toEqual([
				"(A) タスク1",
				"(A) タスク2",
			]);
		});

		it("タスク数と結果行数が一致しない場合エラーを返す", async () => {
			const todos = [
				{ raw: "タスク1", description: "タスク1", completed: false, priority: undefined, projects: [], contexts: [], tags: {}, creationDate: undefined, completionDate: undefined },
				{ raw: "タスク2", description: "タスク2", completed: false, priority: undefined, projects: [], contexts: [], tags: {}, creationDate: undefined, completionDate: undefined },
			];

			const mockResponse = {
				choices: [
					{
						message: {
							content: "(A) タスク1", // 1行しかない
						},
					},
				],
			};

			vi.mocked(requestUrl).mockResolvedValue({
				status: 200,
				json: mockResponse,
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.bulkEditTodos(
				todos,
				"すべてのタスクに優先度Aを設定",
				"2026-01-15",
				{}
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain("mismatch");
		});

		it("APIエラー時にエラーメッセージを返す", async () => {
			const todos = [
				{ raw: "タスク1", description: "タスク1", completed: false, priority: undefined, projects: [], contexts: [], tags: {}, creationDate: undefined, completionDate: undefined },
			];

			vi.mocked(requestUrl).mockResolvedValue({
				status: 500,
				json: {},
				headers: {},
				arrayBuffer: new ArrayBuffer(0),
				text: "",
			});

			const service = new OpenRouterService(mockConfig);
			const result = await service.bulkEditTodos(
				todos,
				"優先度を設定",
				"2026-01-15",
				{}
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain("Server error");
		});
	});
});
