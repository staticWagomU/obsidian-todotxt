/**
 * TagChipInput - チップ形式のタグ入力コンポーネント
 * Gmail風のラベル選択UIを提供
 *
 * @example
 * ```ts
 * const chipInput = new TagChipInput(container, {
 *   type: "project",
 *   prefix: "+",
 *   suggestions: ["work", "home"],
 *   initialValues: ["work"],
 *   onChange: (values) => console.log(values),
 * });
 * ```
 */

export interface TagChipInputOptions {
	/** タグ種別 */
	type: "project" | "context";
	/** 表示プレフィックス */
	prefix: string;
	/** 既存の候補リスト */
	suggestions: string[];
	/** 初期選択値 */
	initialValues?: string[];
	/** 値変更時のコールバック */
	onChange?: (values: string[]) => void;
}

export class TagChipInput {
	private container: HTMLElement;
	private chipsContainer: HTMLElement;
	private input: HTMLInputElement;
	private suggestionsEl: HTMLUListElement;
	private selectedValues: Set<string>;
	private options: TagChipInputOptions;
	private highlightedIndex = -1;
	private filteredSuggestions: string[] = [];

	constructor(parentEl: HTMLElement, options: TagChipInputOptions) {
		this.options = options;
		this.selectedValues = new Set(options.initialValues ?? []);
		this.container = parentEl;

		this.chipsContainer = this.createChipsContainer();
		this.input = this.createInput();
		this.suggestionsEl = this.createSuggestionsDropdown();

		this.chipsContainer.appendChild(this.input);
		this.container.appendChild(this.chipsContainer);
		this.container.appendChild(this.suggestionsEl);

		this.renderChips();
		this.renderSuggestions();
		this.setupEventListeners();
	}

	/** 選択値を取得 */
	getValues(): string[] {
		return Array.from(this.selectedValues);
	}

	/** 選択値を設定 */
	setValues(values: string[]): void {
		this.selectedValues = new Set(values);
		this.renderChips();
		this.notifyChange();
	}

	// ========================================
	// DOM生成
	// ========================================

	private createChipsContainer(): HTMLElement {
		const container = document.createElement("div");
		container.classList.add("tag-chips");
		container.setAttribute("role", "group");
		container.setAttribute(
			"aria-label",
			this.options.type === "project" ? "選択されたプロジェクト" : "選択されたコンテキスト",
		);
		return container;
	}

	private createInput(): HTMLInputElement {
		const input = document.createElement("input");
		input.type = "text";
		input.classList.add("tag-input--inline");
		input.placeholder = "新規追加...";
		input.setAttribute(
			"aria-label",
			this.options.type === "project" ? "新規プロジェクト入力" : "新規コンテキスト入力",
		);
		return input;
	}

	private createSuggestionsDropdown(): HTMLUListElement {
		const ul = document.createElement("ul");
		ul.classList.add("tag-suggestions");
		ul.setAttribute("role", "listbox");
		ul.setAttribute(
			"aria-label",
			this.options.type === "project" ? "プロジェクト候補" : "コンテキスト候補",
		);
		ul.setAttribute("hidden", "");
		return ul;
	}

	// ========================================
	// レンダリング
	// ========================================

	private renderChips(): void {
		// 既存のチップを削除（入力欄は保持）
		const existingChips = this.chipsContainer.querySelectorAll(".tag-chip");
		existingChips.forEach((chip) => {
			chip.remove();
		});

		// 選択値をチップとしてレンダリング
		for (const value of this.selectedValues) {
			const chip = this.createChipElement(value);
			this.chipsContainer.insertBefore(chip, this.input);
		}
	}

	private createChipElement(value: string): HTMLSpanElement {
		const chip = document.createElement("span");
		chip.classList.add("tag-chip", `tag-chip--${this.options.type}`);
		chip.setAttribute("data-value", value);

		// テキスト部分
		const text = document.createTextNode(`${this.options.prefix}${value}`);
		chip.appendChild(text);

		// 削除ボタン
		const removeBtn = document.createElement("button");
		removeBtn.classList.add("tag-chip__remove");
		removeBtn.setAttribute("aria-label", `${this.options.prefix}${value}を削除`);
		removeBtn.textContent = "×";
		removeBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			this.removeChip(value);
		});
		chip.appendChild(removeBtn);

		return chip;
	}

	private renderSuggestions(): void {
		this.suggestionsEl.innerHTML = "";

		// 選択済みを除外してフィルタリング
		const query = this.input.value.toLowerCase().trim();
		this.filteredSuggestions = this.options.suggestions.filter((s) => {
			const notSelected = !this.selectedValues.has(s);
			const matchesQuery = query === "" || s.toLowerCase().includes(query);
			return notSelected && matchesQuery;
		});

		for (const suggestion of this.filteredSuggestions) {
			const li = document.createElement("li");
			li.classList.add("tag-suggestion");
			li.setAttribute("role", "option");
			li.setAttribute("data-value", suggestion);
			li.textContent = `${this.options.prefix}${suggestion}`;
			this.suggestionsEl.appendChild(li);
		}

		this.highlightedIndex = -1;
	}

	// ========================================
	// チップ操作
	// ========================================

	private addChip(value: string): void {
		const trimmed = value.trim();
		if (trimmed === "" || this.selectedValues.has(trimmed)) {
			return;
		}

		this.selectedValues.add(trimmed);
		this.renderChips();
		this.renderSuggestions();
		this.input.value = "";
		this.notifyChange();
	}

	private removeChip(value: string): void {
		this.selectedValues.delete(value);
		this.renderChips();
		this.renderSuggestions();
		this.notifyChange();
	}

	private removeLastChip(): void {
		const values = Array.from(this.selectedValues);
		if (values.length > 0) {
			const last = values[values.length - 1];
			if (last !== undefined) {
				this.removeChip(last);
			}
		}
	}

	// ========================================
	// 候補表示制御
	// ========================================

	private showSuggestions(): void {
		this.renderSuggestions();
		if (this.filteredSuggestions.length > 0) {
			this.suggestionsEl.removeAttribute("hidden");
		}
	}

	private hideSuggestions(): void {
		this.suggestionsEl.setAttribute("hidden", "");
		this.highlightedIndex = -1;
		this.updateHighlight();
	}

	// ========================================
	// キーボードナビゲーション
	// ========================================

	private highlightNext(): void {
		if (this.filteredSuggestions.length === 0) return;

		this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredSuggestions.length;
		this.updateHighlight();
	}

	private highlightPrev(): void {
		if (this.filteredSuggestions.length === 0) return;

		this.highlightedIndex =
			this.highlightedIndex <= 0
				? this.filteredSuggestions.length - 1
				: this.highlightedIndex - 1;
		this.updateHighlight();
	}

	private updateHighlight(): void {
		const items = this.suggestionsEl.querySelectorAll(".tag-suggestion");
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (i === this.highlightedIndex) {
				item?.classList.add("tag-suggestion--highlighted");
			} else {
				item?.classList.remove("tag-suggestion--highlighted");
			}
		}
	}

	private selectHighlighted(): boolean {
		if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredSuggestions.length) {
			const value = this.filteredSuggestions[this.highlightedIndex];
			if (value !== undefined) {
				this.addChip(value);
				this.hideSuggestions();
				return true;
			}
		}
		return false;
	}

	// ========================================
	// イベントリスナー
	// ========================================

	private setupEventListeners(): void {
		// 入力フォーカス時に候補表示
		this.input.addEventListener("focus", () => {
			this.showSuggestions();
		});

		// 入力時にフィルタリング
		this.input.addEventListener("input", () => {
			this.showSuggestions();
		});

		// キーボード操作
		this.input.addEventListener("keydown", (e) => {
			this.handleKeyDown(e);
		});

		// 候補クリック
		this.suggestionsEl.addEventListener("click", (e) => {
			const target = e.target as HTMLElement;
			const suggestion = target.closest(".tag-suggestion");
			if (suggestion) {
				const value = suggestion.getAttribute("data-value");
				if (value) {
					this.addChip(value);
					this.hideSuggestions();
				}
			}
		});

		// コンテナ外クリックで候補を閉じる
		document.addEventListener("click", (e) => {
			if (!this.container.contains(e.target as Node)) {
				this.hideSuggestions();
			}
		});
	}

	private handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			case "Enter":
				e.preventDefault();
				// ハイライトされた候補があれば選択、なければ入力値を追加
				if (!this.selectHighlighted()) {
					const value = this.input.value.trim();
					if (value) {
						this.addChip(value);
					}
				}
				break;

			case "Backspace":
				// 入力欄が空の場合、最後のチップを削除
				if (this.input.value === "") {
					this.removeLastChip();
				}
				break;

			case "ArrowDown":
				e.preventDefault();
				this.highlightNext();
				break;

			case "ArrowUp":
				e.preventDefault();
				this.highlightPrev();
				break;

			case "Escape":
				this.hideSuggestions();
				break;
		}
	}

	// ========================================
	// コールバック
	// ========================================

	private notifyChange(): void {
		this.options.onChange?.(this.getValues());
	}
}
