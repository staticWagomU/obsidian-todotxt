/**
 * TagChipInput コンポーネントのテスト
 * Gmail風チップ/タグ入力UI
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TagChipInput } from "./TagChipInput";

describe("TagChipInput", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
	});

	// ========================================
	// 初期化テスト
	// ========================================

	describe("initialization", () => {
		it("should create chip container element", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
			});

			const chipsContainer = container.querySelector(".tag-chips");
			expect(chipsContainer).not.toBeNull();
		});

		it("should create inline input element", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
			});

			const input = container.querySelector(".tag-input--inline");
			expect(input).not.toBeNull();
		});

		it("should create suggestions dropdown (hidden by default)", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
			});

			const suggestions = container.querySelector(".tag-suggestions");
			expect(suggestions).not.toBeNull();
			expect(suggestions?.hasAttribute("hidden")).toBe(true);
		});

		it("should render initial values as chips", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
				initialValues: ["work"],
			});

			const chips = container.querySelectorAll(".tag-chip--project");
			expect(chips.length).toBe(1);
			expect(chips[0]?.textContent).toContain("+work");
		});
	});

	// ========================================
	// 値の取得・設定テスト
	// ========================================

	describe("getValues / setValues", () => {
		it("should return empty array when no values selected", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
			});

			expect(input.getValues()).toEqual([]);
		});

		it("should return initial values", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
				initialValues: ["work", "home"],
			});

			expect(input.getValues()).toEqual(["work", "home"]);
		});

		it("should update chips when setValues is called", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home", "office"],
			});

			input.setValues(["work", "office"]);

			const chips = container.querySelectorAll(".tag-chip--project");
			expect(chips.length).toBe(2);
			expect(input.getValues()).toEqual(["work", "office"]);
		});
	});

	// ========================================
	// チップ追加テスト
	// ========================================

	describe("adding chips", () => {
		it("should add chip when suggestion is clicked", () => {
			const input = new TagChipInput(container, {
				type: "context",
				prefix: "@",
				suggestions: ["home", "office"],
			});

			// フォーカスして候補を表示
			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.dispatchEvent(new Event("focus"));

			// 候補をクリック
			const suggestion = container.querySelector('.tag-suggestion[data-value="home"]');
			suggestion?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

			expect(input.getValues()).toContain("home");
			const chips = container.querySelectorAll(".tag-chip--context");
			expect(chips.length).toBe(1);
		});

		it("should add chip when Enter is pressed with input value", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "newproject";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(input.getValues()).toContain("newproject");
		});

		it("should not add duplicate chips", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work"],
				initialValues: ["work"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "work";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(input.getValues()).toEqual(["work"]);
		});

		it("should clear input after adding chip", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "newproject";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(inputEl.value).toBe("");
		});

		it("should trim whitespace and reject empty values", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "   ";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(input.getValues()).toEqual([]);
		});
	});

	// ========================================
	// チップ削除テスト
	// ========================================

	describe("removing chips", () => {
		it("should remove chip when remove button is clicked", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
				initialValues: ["work", "home"],
			});

			const removeBtn = container.querySelector(".tag-chip__remove");
			removeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

			expect(input.getValues().length).toBe(1);
		});

		it("should remove last chip when Backspace is pressed with empty input", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
				initialValues: ["work", "home"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

			expect(input.getValues()).toEqual(["work"]);
		});

		it("should not remove chip when Backspace is pressed with non-empty input", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
				initialValues: ["work", "home"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "test";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

			expect(input.getValues()).toEqual(["work", "home"]);
		});
	});

	// ========================================
	// 候補フィルタリングテスト
	// ========================================

	describe("suggestion filtering", () => {
		it("should filter suggestions based on input", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "homework", "office"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.value = "work";
			inputEl.dispatchEvent(new Event("input"));

			const visibleSuggestions = container.querySelectorAll(".tag-suggestion:not([hidden])");
			// "work" と "homework" がマッチ
			expect(visibleSuggestions.length).toBe(2);
		});

		it("should hide already selected values from suggestions", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home", "office"],
				initialValues: ["work"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.dispatchEvent(new Event("focus"));

			// workは選択済みなので候補に表示されない
			const suggestions = container.querySelectorAll(".tag-suggestion");
			const values = Array.from(suggestions).map((s) => s.getAttribute("data-value"));
			expect(values).not.toContain("work");
		});
	});

	// ========================================
	// キーボードナビゲーションテスト
	// ========================================

	describe("keyboard navigation", () => {
		it("should highlight next suggestion on ArrowDown", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home", "office"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.dispatchEvent(new Event("focus"));
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

			const highlighted = container.querySelector(".tag-suggestion--highlighted");
			expect(highlighted).not.toBeNull();
		});

		it("should select highlighted suggestion on Enter", () => {
			const input = new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.dispatchEvent(new Event("focus"));
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(input.getValues().length).toBe(1);
		});

		it("should close suggestions on Escape", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.focus();
			inputEl.dispatchEvent(new Event("focus"));
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

			const suggestions = container.querySelector(".tag-suggestions");
			expect(suggestions?.hasAttribute("hidden")).toBe(true);
		});
	});

	// ========================================
	// コールバックテスト
	// ========================================

	describe("onChange callback", () => {
		it("should call onChange when chip is added", () => {
			const onChange = vi.fn();
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: [],
				onChange,
			});

			const inputEl = container.querySelector(".tag-input--inline") as HTMLInputElement;
			inputEl.value = "newproject";
			inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(onChange).toHaveBeenCalledWith(["newproject"]);
		});

		it("should call onChange when chip is removed", () => {
			const onChange = vi.fn();
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work"],
				initialValues: ["work"],
				onChange,
			});

			const removeBtn = container.querySelector(".tag-chip__remove");
			removeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

			expect(onChange).toHaveBeenCalledWith([]);
		});
	});

	// ========================================
	// アクセシビリティテスト
	// ========================================

	describe("accessibility", () => {
		it("should have proper ARIA roles", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work", "home"],
			});

			const suggestions = container.querySelector(".tag-suggestions");
			expect(suggestions?.getAttribute("role")).toBe("listbox");

			const suggestionItems = container.querySelectorAll(".tag-suggestion");
			suggestionItems.forEach((item) => {
				expect(item.getAttribute("role")).toBe("option");
			});
		});

		it("should have aria-label on remove buttons", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work"],
				initialValues: ["work"],
			});

			const removeBtn = container.querySelector(".tag-chip__remove");
			expect(removeBtn?.getAttribute("aria-label")).toContain("work");
		});
	});

	// ========================================
	// タイプ別スタイリングテスト
	// ========================================

	describe("type-specific styling", () => {
		it("should use project class for project type", () => {
			new TagChipInput(container, {
				type: "project",
				prefix: "+",
				suggestions: ["work"],
				initialValues: ["work"],
			});

			const chip = container.querySelector(".tag-chip--project");
			expect(chip).not.toBeNull();
		});

		it("should use context class for context type", () => {
			new TagChipInput(container, {
				type: "context",
				prefix: "@",
				suggestions: ["home"],
				initialValues: ["home"],
			});

			const chip = container.querySelector(".tag-chip--context");
			expect(chip).not.toBeNull();
		});
	});
});
