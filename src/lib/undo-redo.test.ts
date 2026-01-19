import { describe, it, expect } from "vitest";
import { UndoRedoHistory } from "./undo-redo";

describe("UndoRedoHistory", () => {
	describe("基本動作", () => {
		it("初期状態ではcanUndoとcanRedoがfalseを返す", () => {
			const history = new UndoRedoHistory<string>();
			expect(history.canUndo()).toBe(false);
			expect(history.canRedo()).toBe(false);
		});

		it("push後にcanUndoがtrueを返す", () => {
			const history = new UndoRedoHistory<string>();
			// 初期状態として保存
			history.push("initial");
			// 変更後の状態として保存（これでundoが可能になる）
			history.push("state1");
			expect(history.canUndo()).toBe(true);
			expect(history.canRedo()).toBe(false);
		});

		it("undoで前の状態を取得できる", () => {
			const history = new UndoRedoHistory<string>();
			history.push("state1");
			history.push("state2");

			const result = history.undo();
			expect(result).toBe("state1");
			expect(history.canUndo()).toBe(false);
			expect(history.canRedo()).toBe(true);
		});

		it("redoで次の状態を取得できる", () => {
			const history = new UndoRedoHistory<string>();
			history.push("state1");
			history.push("state2");
			history.undo();

			const result = history.redo();
			expect(result).toBe("state2");
			expect(history.canUndo()).toBe(true);
			expect(history.canRedo()).toBe(false);
		});

		it("空の状態でundoするとundefinedを返す", () => {
			const history = new UndoRedoHistory<string>();
			const result = history.undo();
			expect(result).toBeUndefined();
		});

		it("redoStackが空の状態でredoするとundefinedを返す", () => {
			const history = new UndoRedoHistory<string>();
			history.push("state1");
			const result = history.redo();
			expect(result).toBeUndefined();
		});

		it("push後にredoStackがクリアされる", () => {
			const history = new UndoRedoHistory<string>();
			history.push("state1");
			history.push("state2");
			history.undo();
			expect(history.canRedo()).toBe(true);

			history.push("state3");
			expect(history.canRedo()).toBe(false);
		});

		it("clearで履歴がリセットされる", () => {
			const history = new UndoRedoHistory<string>();
			history.push("state1");
			history.push("state2");
			history.undo();

			history.clear();
			expect(history.canUndo()).toBe(false);
			expect(history.canRedo()).toBe(false);
			expect(history.getHistoryLength()).toBe(0);
		});

		it("getHistoryLengthでundo履歴の長さを取得できる", () => {
			const history = new UndoRedoHistory<string>();
			expect(history.getHistoryLength()).toBe(0);

			history.push("state1");
			expect(history.getHistoryLength()).toBe(1);

			history.push("state2");
			expect(history.getHistoryLength()).toBe(2);

			history.undo();
			expect(history.getHistoryLength()).toBe(1);
		});
	});
});
