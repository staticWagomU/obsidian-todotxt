export interface RetryConfig {
	enabled: boolean;
	maxRetries: number;
	initialDelayMs: number;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(error: unknown): boolean {
	// ネットワークエラー (Error オブジェクト)
	if (error instanceof Error) {
		return true;
	}

	// HTTPステータスコード付きエラー
	if (typeof error === "object" && error !== null && "status" in error) {
		const status = (error as { status: number }).status;
		return status === 429 || (status >= 500 && status < 600);
	}

	return false;
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	config: RetryConfig,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// リトライ無効なら即座に throw
			if (!config.enabled) {
				throw error;
			}

			// リトライ不可エラーなら即座に throw
			if (!isRetryableError(error)) {
				throw error;
			}

			// 最大リトライ回数に達したら throw
			if (attempt === config.maxRetries) {
				throw error;
			}

			// Exponential backoff
			const delay = config.initialDelayMs * Math.pow(2, attempt);
			await sleep(delay);
		}
	}

	throw lastError;
}
