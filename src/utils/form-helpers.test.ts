/**
 * Form Helper Utilities Tests
 */

import { describe, it, expect } from "vitest";
import { buildDescriptionWithTags, buildTextFromFormValues } from "./form-helpers";

describe("buildDescriptionWithTags", () => {
	it("基本のdescriptionのみの場合、そのまま返す", () => {
		const result = buildDescriptionWithTags("Buy milk");
		expect(result).toBe("Buy milk");
	});

	it("due:タグが指定された場合、descriptionに追加される", () => {
		const result = buildDescriptionWithTags("Buy milk", "2026-01-15");
		expect(result).toBe("Buy milk due:2026-01-15");
	});

	it("t:タグが指定された場合、descriptionに追加される", () => {
		const result = buildDescriptionWithTags("Buy milk", undefined, "2026-01-10");
		expect(result).toBe("Buy milk t:2026-01-10");
	});

	it("due:とt:両方が指定された場合、両方追加される", () => {
		const result = buildDescriptionWithTags("Buy milk", "2026-01-15", "2026-01-10");
		expect(result).toBe("Buy milk due:2026-01-15 t:2026-01-10");
	});

	it("空文字列のタグは追加されない", () => {
		const result = buildDescriptionWithTags("Buy milk", "", "");
		expect(result).toBe("Buy milk");
	});

	it("description内の既存t:タグはフォーム値で上書きされる", () => {
		const result = buildDescriptionWithTags("Buy milk t:2026-01-01", undefined, "2026-01-15");
		expect(result).toBe("Buy milk t:2026-01-15");
	});

	it("description内の既存due:タグはフォーム値で上書きされる", () => {
		const result = buildDescriptionWithTags("Buy milk due:2026-01-01", "2026-01-15");
		expect(result).toBe("Buy milk due:2026-01-15");
	});

	it("description内に既存タグがありフォーム値が空の場合、タグは削除される", () => {
		const result = buildDescriptionWithTags("Buy milk t:2026-01-01 due:2026-01-05");
		expect(result).toBe("Buy milk");
	});

	it("フォーム値で上書きすると重複タグは発生しない", () => {
		const result = buildDescriptionWithTags("Buy milk t:2026-01-01", "2026-01-20", "2026-01-10");
		expect(result).toBe("Buy milk due:2026-01-20 t:2026-01-10");
	});
});

describe("buildTextFromFormValues", () => {
	it("description内の既存t:タグはフォーム値で上書きされる", () => {
		const result = buildTextFromFormValues("Buy milk t:2026-01-01", undefined, undefined, "2026-01-15");
		expect(result).toBe("Buy milk t:2026-01-15");
	});

	it("フォーム値で上書きすると重複タグは発生しない", () => {
		const result = buildTextFromFormValues("Buy milk t:2026-01-01", "A", "2026-01-20", "2026-01-10");
		expect(result).toBe("(A) Buy milk due:2026-01-20 t:2026-01-10");
	});
});
