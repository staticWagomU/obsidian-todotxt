/**
 * Form Helper Utilities Tests
 */

import { describe, it, expect } from "vitest";
import { buildDescriptionWithTags } from "./form-helpers";

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
});
