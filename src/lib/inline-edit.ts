/**
 * InlineEditState - インライン編集の状態を管理するクラス
 *
 * タスクのインライン編集機能の状態管理を担当:
 * - 編集モードの開始・終了
 * - 編集中のタスクインデックス管理
 * - 元の値と現在の編集値の保持
 */
export class InlineEditState {
	private editing: boolean = false;
	private editingIndex: number | null = null;
	private originalValue: string | null = null;
	private currentValue: string | null = null;

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
}
