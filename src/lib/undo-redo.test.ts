import { describe, it, expect } from "vitest";
import { UndoRedoHistory, createSnapshot } from "./undo-redo";

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

	describe("maxSize制限 (AC5)", () => {
		it("21件push時に最古が削除され20件維持される", () => {
			const history = new UndoRedoHistory<string>(20);

			// 21件pushする
			for (let i = 0; i <= 20; i++) {
				history.push(`state${i}`);
			}

			// 履歴は20件に制限される
			expect(history.getHistoryLength()).toBe(20);

			// 最古の"state0"は削除されている
			// 20回undoして確認
			let undoCount = 0;
			let lastUndoResult: string | undefined;
			while (history.canUndo()) {
				lastUndoResult = history.undo();
				undoCount++;
			}

			// 19回undoできる（20件中、最初の1件は初期状態）
			expect(undoCount).toBe(19);
			// 最後のundoでstate1に戻る（state0は削除されている）
			expect(lastUndoResult).toBe("state1");
		});

		it("カスタムmaxSizeで制限される", () => {
			const history = new UndoRedoHistory<string>(5);

			for (let i = 0; i <= 10; i++) {
				history.push(`state${i}`);
			}

			expect(history.getHistoryLength()).toBe(5);
		});
	});

	describe("createSnapshot (AC3)", () => {
		it("タスク追加時にスナップショットが作成される", () => {
			const history = new UndoRedoHistory<string>();
			const initialData = "Task 1\nTask 2\n";

			createSnapshot(history, initialData);
			const afterAddData = "Task 1\nTask 2\nTask 3\n";
			createSnapshot(history, afterAddData);

			expect(history.getHistoryLength()).toBe(2);
			expect(history.canUndo()).toBe(true);

			const undoneState = history.undo();
			expect(undoneState).toBe(initialData);
		});

		it("タスク編集時にスナップショットが作成される", () => {
			const history = new UndoRedoHistory<string>();
			const initialData = "Task 1\n";

			createSnapshot(history, initialData);
			const afterEditData = "Edited Task 1\n";
			createSnapshot(history, afterEditData);

			expect(history.getHistoryLength()).toBe(2);
			const undoneState = history.undo();
			expect(undoneState).toBe(initialData);
		});

		it("タスク削除時にスナップショットが作成される", () => {
			const history = new UndoRedoHistory<string>();
			const initialData = "Task 1\nTask 2\n";

			createSnapshot(history, initialData);
			const afterDeleteData = "Task 1\n";
			createSnapshot(history, afterDeleteData);

			expect(history.getHistoryLength()).toBe(2);
			const undoneState = history.undo();
			expect(undoneState).toBe(initialData);
		});

		it("タスク完了状態変更時にスナップショットが作成される", () => {
			const history = new UndoRedoHistory<string>();
			const initialData = "Task 1\n";

			createSnapshot(history, initialData);
			const afterToggleData = "x 2026-01-19 Task 1\n";
			createSnapshot(history, afterToggleData);

			expect(history.getHistoryLength()).toBe(2);
			const undoneState = history.undo();
			expect(undoneState).toBe(initialData);
		});
	});
});
