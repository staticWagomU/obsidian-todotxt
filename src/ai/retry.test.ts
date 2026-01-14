import { describe, it, expect, vi } from "vitest";
import { withRetry, isRetryableError } from "./retry";

describe("retry", () => {
	describe("isRetryableError", () => {
		it("ネットワークエラーはリトライ可能と判定される", () => {
			const networkError = new Error("Network error");
			expect(isRetryableError(networkError)).toBe(true);
		});

		it("429エラーはリトライ可能と判定される", () => {
			const rateLimitError = { status: 429, message: "Rate limit" };
			expect(isRetryableError(rateLimitError)).toBe(true);
		});

		it("500番台エラーはリトライ可能と判定される", () => {
			const serverError = { status: 500, message: "Server error" };
			expect(isRetryableError(serverError)).toBe(true);
		});

		it("400番台エラー(429以外)はリトライ不可と判定される", () => {
			const badRequest = { status: 400, message: "Bad request" };
			expect(isRetryableError(badRequest)).toBe(false);
		});
	});

	describe("withRetry", () => {
		it("成功時は即座に結果を返す", async () => {
			const fn = vi.fn().mockResolvedValue("success");
			const config = { enabled: true, maxRetries: 3, initialDelayMs: 100 };

			const result = await withRetry(fn, config);

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("リトライ有効時、指定回数までリトライする", async () => {
			const fn = vi.fn()
				.mockRejectedValueOnce({ status: 500 })
				.mockRejectedValueOnce({ status: 500 })
				.mockResolvedValue("success");
			const config = { enabled: true, maxRetries: 3, initialDelayMs: 100 };

			const result = await withRetry(fn, config);

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(3);
		});

		it("最大リトライ回数を超えた場合はエラーをthrowする", async () => {
			const fn = vi.fn().mockRejectedValue({ status: 500 });
			const config = { enabled: true, maxRetries: 2, initialDelayMs: 100 };

			await expect(withRetry(fn, config)).rejects.toEqual({ status: 500 });
			expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
		});

		it("リトライ無効時は即座にエラーをthrowする", async () => {
			const fn = vi.fn().mockRejectedValue({ status: 500 });
			const config = { enabled: false, maxRetries: 3, initialDelayMs: 100 };

			await expect(withRetry(fn, config)).rejects.toEqual({ status: 500 });
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("リトライ不可エラーは即座にthrowする", async () => {
			const fn = vi.fn().mockRejectedValue({ status: 400 });
			const config = { enabled: true, maxRetries: 3, initialDelayMs: 100 };

			await expect(withRetry(fn, config)).rejects.toEqual({ status: 400 });
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("exponential backoffでリトライ間隔が増加する", async () => {
			const fn = vi.fn()
				.mockRejectedValueOnce({ status: 500 })
				.mockRejectedValueOnce({ status: 500 })
				.mockResolvedValue("success");
			const config = { enabled: true, maxRetries: 3, initialDelayMs: 100 };

			const startTime = Date.now();
			await withRetry(fn, config);
			const duration = Date.now() - startTime;

			// 100ms + 200ms = 300ms minimum
			expect(duration).toBeGreaterThanOrEqual(300);
		});
	});
});
