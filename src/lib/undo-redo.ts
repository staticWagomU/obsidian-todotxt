/**
 * Undo/Redo履歴管理クラス
 * 状態のスナップショットをスタックで管理し、元に戻す/やり直しを実現する
 *
 * 設計:
 * - undoStackには「過去の状態」を保存（現在の状態は含まない）
 * - push時に「現在の状態」を渡すと、それが「1つ前の状態」としてundoStackに積まれる
 * - undo時に返される値は「戻る先の状態」
 */
export class UndoRedoHistory<T> {
	private undoStack: T[] = [];
	private redoStack: T[] = [];
	private maxSize: number;

	constructor(maxSize = 20) {
		this.maxSize = maxSize;
	}

	/**
	 * 新しい状態をundo履歴に追加
	 * redo履歴はクリアされる
	 */
	push(state: T): void {
		this.undoStack.push(state);
		this.redoStack = [];

		// maxSizeを超えたら最古を削除
		if (this.undoStack.length > this.maxSize) {
			this.undoStack.shift();
		}
	}

	/**
	 * undoを実行し、前の状態を返す
	 * 最新の状態をredoStackに移動し、1つ前の状態を返す
	 */
	undo(): T | undefined {
		if (this.undoStack.length < 2) {
			return undefined;
		}
		// 現在の状態（最新）をredoStackに移動
		const current = this.undoStack.pop();
		if (current !== undefined) {
			this.redoStack.push(current);
		}
		// 1つ前の状態を返す（これが新しい「現在」になる）
		return this.undoStack[this.undoStack.length - 1];
	}

	/**
	 * redoを実行し、次の状態を返す
	 */
	redo(): T | undefined {
		const state = this.redoStack.pop();
		if (state !== undefined) {
			this.undoStack.push(state);
		}
		return state;
	}

	/**
	 * undoが可能かどうか
	 * undoStackに2つ以上ある時にundoが可能（現在の状態と戻り先が必要）
	 */
	canUndo(): boolean {
		return this.undoStack.length >= 2;
	}

	/**
	 * redoが可能かどうか
	 */
	canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	/**
	 * 履歴をクリア
	 */
	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
	}

	/**
	 * undo履歴の長さを取得
	 */
	getHistoryLength(): number {
		return this.undoStack.length;
	}
}

/**
 * 現在の状態をスナップショットとして履歴に追加 (AC3)
 * タスクの追加・編集・削除・完了状態変更時に呼び出す
 */
export function createSnapshot(
	history: UndoRedoHistory<string>,
	currentData: string,
): void {
	history.push(currentData);
}
