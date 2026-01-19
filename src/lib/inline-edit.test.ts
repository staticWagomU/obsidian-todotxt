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

	describe("cancel() - Escキーでキャンセル (AC3)", () => {
		it("cancel()で編集モードが終了する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Modified task");
			state.cancel();
			expect(state.isEditing()).toBe(false);
		});

		it("cancel()で元の値を復元して返す", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Modified task");
			const restored = state.cancel();
			expect(restored).toBe("Original task");
		});

		it("cancel()で編集していない状態だとnullを返す", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			const restored = state.cancel();
			expect(restored).toBeNull();
		});

		it("cancel()後に状態がクリアされる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Modified task");
			state.cancel();
			expect(state.getEditingIndex()).toBeNull();
			expect(state.getOriginalValue()).toBeNull();
			expect(state.getCurrentValue()).toBeNull();
		});

		it("cancel()でonCancelコールバックが呼ばれる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const onCancel = vi.fn();
			const state = new InlineEditState({ onCancel });
			state.start(0, "Original task");
			state.setCurrentValue("Modified task");
			state.cancel();
			expect(onCancel).toHaveBeenCalledWith(0, "Original task");
		});
	});

	describe("save() - Enter/Cmd+Enterで保存 (AC4)", () => {
		it("save()で編集モードが終了する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			state.save();
			expect(state.isEditing()).toBe(false);
		});

		it("save()で現在の値を返す", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			const saved = state.save();
			expect(saved).toBe("Updated task");
		});

		it("save()で編集していない状態だとnullを返す", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			const saved = state.save();
			expect(saved).toBeNull();
		});

		it("save()後に状態がクリアされる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			state.save();
			expect(state.getEditingIndex()).toBeNull();
			expect(state.getOriginalValue()).toBeNull();
			expect(state.getCurrentValue()).toBeNull();
		});

		it("save()でonSaveコールバックが呼ばれる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const onSave = vi.fn();
			const state = new InlineEditState({ onSave });
			state.start(2, "Original task");
			state.setCurrentValue("Updated task");
			state.save();
			expect(onSave).toHaveBeenCalledWith(2, "Updated task");
		});

		it("save()で変更がない場合もonSaveコールバックが呼ばれる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const onSave = vi.fn();
			const state = new InlineEditState({ onSave });
			state.start(0, "Same task");
			// 値を変更しない
			state.save();
			expect(onSave).toHaveBeenCalledWith(0, "Same task");
		});
	});

	describe("handleBlur() - 外部クリック時の自動保存 (AC5)", () => {
		it("handleBlur()で編集モードが終了する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			state.handleBlur();
			expect(state.isEditing()).toBe(false);
		});

		it("handleBlur()で現在の値を自動保存する", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const onSave = vi.fn();
			const state = new InlineEditState({ onSave });
			state.start(1, "Original task");
			state.setCurrentValue("Auto-saved task");
			state.handleBlur();
			expect(onSave).toHaveBeenCalledWith(1, "Auto-saved task");
		});

		it("handleBlur()で編集していない状態だと何もしない", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const onSave = vi.fn();
			const state = new InlineEditState({ onSave });
			state.handleBlur();
			expect(onSave).not.toHaveBeenCalled();
		});

		it("handleBlur()後に状態がクリアされる", async () => {
			const { InlineEditState } = await import("./inline-edit");
			const state = new InlineEditState();
			state.start(0, "Original task");
			state.setCurrentValue("Updated task");
			state.handleBlur();
			expect(state.getEditingIndex()).toBeNull();
			expect(state.getOriginalValue()).toBeNull();
			expect(state.getCurrentValue()).toBeNull();
		});
	});
});
