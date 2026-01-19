import { describe, it, expect, vi } from "vitest";

describe("InlineEditState", () => {
	describe("編集状態の開始・終了", () => {
		it("初期状態では編集中ではない", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			expect(state.isEditing()).toBe(false);
		});

		it("start()で編集モードを開始できる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			expect(state.isEditing()).toBe(true);
		});

		it("stop()で編集モードを終了できる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.stop();
			expect(state.isEditing()).toBe(false);
		});
	});

	describe("編集対象インデックス管理", () => {
		it("start()で指定したインデックスを保持する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(5, "Task at index 5");
			expect(state.getEditingIndex()).toBe(5);
		});

		it("編集していない状態ではインデックスはnull", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			expect(state.getEditingIndex()).toBeNull();
		});

		it("stop()後はインデックスがnullになる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(3, "Some task");
			state.stop();
			expect(state.getEditingIndex()).toBeNull();
		});
	});

	describe("元の値保持", () => {
		it("start()で指定した元の値を保持する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task description");
			expect(state.getOriginalValue()).toBe("Original task description");
		});

		it("編集していない状態では元の値はnull", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			expect(state.getOriginalValue()).toBeNull();
		});

		it("stop()後は元の値がnullになる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.stop();
			expect(state.getOriginalValue()).toBeNull();
		});
	});

	describe("現在の編集値", () => {
		it("start()直後は元の値と同じ", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			expect(state.getCurrentValue()).toBe("Original task");
		});

		it("setCurrentValue()で現在の値を更新できる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			expect(state.getCurrentValue()).toBe("Updated task");
		});

		it("編集していない状態では現在の値はnull", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			expect(state.getCurrentValue()).toBeNull();
		});
	});
});
