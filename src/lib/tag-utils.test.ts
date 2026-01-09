/**
 * Tag utilities tests
 * Tests for key:value tag manipulation logic
 */

import { describe, expect, test } from "vitest";
import { addTag, removeTag, updateTag, parseTagInput, serializeTags } from "./tag-utils";

describe("addTag", () => {
	test("新しいタグを追加", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = addTag(tags, "priority", "high");
		expect(result).toEqual({ due: "2025-01-10", priority: "high" });
	});

	test("空のタグオブジェクトにタグを追加", () => {
		const result = addTag({}, "key", "value");
		expect(result).toEqual({ key: "value" });
	});

	test("既存のタグを上書き", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = addTag(tags, "due", "2025-01-15");
		expect(result).toEqual({ due: "2025-01-15" });
	});

	test("元のオブジェクトを変更しない (immutable)", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = addTag(tags, "key", "value");
		expect(tags).toEqual({ due: "2025-01-10" }); // Original unchanged
		expect(result).toEqual({ due: "2025-01-10", key: "value" });
	});
});

describe("removeTag", () => {
	test("既存のタグを削除", () => {
		const tags: Record<string, string> = { due: "2025-01-10", priority: "high" };
		const result = removeTag(tags, "priority");
		expect(result).toEqual({ due: "2025-01-10" });
	});

	test("存在しないキーを削除しても影響なし", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = removeTag(tags, "nonexistent");
		expect(result).toEqual({ due: "2025-01-10" });
	});

	test("空のタグオブジェクトから削除", () => {
		const result = removeTag({}, "key");
		expect(result).toEqual({});
	});

	test("元のオブジェクトを変更しない (immutable)", () => {
		const tags: Record<string, string> = { due: "2025-01-10", priority: "high" };
		const result = removeTag(tags, "priority");
		expect(tags).toEqual({ due: "2025-01-10", priority: "high" }); // Original unchanged
		expect(result).toEqual({ due: "2025-01-10" });
	});
});

describe("updateTag", () => {
	test("既存のタグの値を更新", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = updateTag(tags, "due", "2025-01-15");
		expect(result).toEqual({ due: "2025-01-15" });
	});

	test("存在しないキーを更新すると追加される", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		const result = updateTag(tags, "priority", "high");
		expect(result).toEqual({ due: "2025-01-10", priority: "high" });
	});
});

describe("parseTagInput", () => {
	test("key:value 形式の文字列をパース", () => {
		const result = parseTagInput("due:2025-01-10");
		expect(result).toEqual({ key: "due", value: "2025-01-10" });
	});

	test("コロン前後の空白を除去", () => {
		const result = parseTagInput("  due : 2025-01-10  ");
		expect(result).toEqual({ key: "due", value: "2025-01-10" });
	});

	test("無効な形式 (コロンなし) の場合、null を返す", () => {
		expect(parseTagInput("invalidtag")).toBe(null);
	});

	test("空文字列の場合、null を返す", () => {
		expect(parseTagInput("")).toBe(null);
	});

	test("キーまたは値が空の場合、null を返す", () => {
		expect(parseTagInput(":value")).toBe(null);
		expect(parseTagInput("key:")).toBe(null);
	});
});

describe("serializeTags", () => {
	test("タグオブジェクトを key:value 文字列に変換", () => {
		const tags: Record<string, string> = { due: "2025-01-10", priority: "high" };
		const result = serializeTags(tags);
		expect(result).toBe("due:2025-01-10 priority:high");
	});

	test("空のタグオブジェクトの場合、空文字列を返す", () => {
		expect(serializeTags({})).toBe("");
	});

	test("単一タグの場合、正しく変換", () => {
		const tags: Record<string, string> = { due: "2025-01-10" };
		expect(serializeTags(tags)).toBe("due:2025-01-10");
	});
});
