/**
 * コールバック設定
 */
export interface InlineEditCallbacks {
	/** キャンセル時のコールバック (index, originalValue) */
	onCancel?: (index: number, originalValue: string) => void;
	/** 保存時のコールバック (index, newValue) */
	onSave?: (index: number, newValue: string) => void;
}

/**
 * InlineEditState - インライン編集の状態を管理するクラス
 *
 * タスクのインライン編集機能の状態管理を担当:
 * - 編集モードの開始・終了
 * - 編集中のタスクインデックス管理
 * - 元の値と現在の編集値の保持
 * - キャンセル・保存操作
 */
export class InlineEditState {
	private editing: boolean = false;
	private editingIndex: number | null = null;
	private originalValue: string | null = null;
	private currentValue: string | null = null;
	private callbacks: InlineEditCallbacks;

	constructor(callbacks: InlineEditCallbacks = {}) {
		this.callbacks = callbacks;
	}

	/**
	 * 編集中かどうかを返す
	 */
	isEditing(): boolean {
		return this.editing;
	}

	/**
	 * 編集モードを開始する
	 * @param index 編集対象のタスクインデックス
	 * @param value 元のタスク内容
	 */
	start(index: number, value: string): void {
		this.editing = true;
		this.editingIndex = index;
		this.originalValue = value;
		this.currentValue = value;
	}

	/**
	 * 編集モードを終了する
	 */
	stop(): void {
		this.editing = false;
		this.editingIndex = null;
		this.originalValue = null;
		this.currentValue = null;
	}

	/**
	 * 編集中のタスクインデックスを取得
	 */
	getEditingIndex(): number | null {
		return this.editingIndex;
	}

	/**
	 * 元の値を取得
	 */
	getOriginalValue(): string | null {
		return this.originalValue;
	}

	/**
	 * 現在の編集値を取得
	 */
	getCurrentValue(): string | null {
		return this.currentValue;
	}

	/**
	 * 現在の編集値を設定
	 */
	setCurrentValue(value: string): void {
		if (this.editing) {
			this.currentValue = value;
		}
	}

	/**
	 * 編集をキャンセルして元の値を復元
	 * @returns 元の値、編集中でなければnull
	 */
	cancel(): string | null {
		if (!this.editing) {
			return null;
		}

		const index = this.editingIndex;
		const original = this.originalValue;

		// コールバック呼び出し
		if (this.callbacks.onCancel && index !== null && original !== null) {
			this.callbacks.onCancel(index, original);
		}

		// 状態をクリア
		this.stop();

		return original;
	}

	/**
	 * 編集内容を保存
	 * @returns 保存した値、編集中でなければnull
	 */
	save(): string | null {
		if (!this.editing) {
			return null;
		}

		const index = this.editingIndex;
		const current = this.currentValue;

		// コールバック呼び出し
		if (this.callbacks.onSave && index !== null && current !== null) {
			this.callbacks.onSave(index, current);
		}

		// 状態をクリア
		this.stop();

		return current;
	}

	/**
	 * フォーカスを失った時の処理（自動保存）
	 * 編集中であれば現在の値を保存する
	 */
	handleBlur(): void {
		if (!this.editing) {
			return;
		}

		// 自動保存（save()を再利用）
		this.save();
	}
}
