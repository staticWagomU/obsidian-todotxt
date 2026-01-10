import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditTaskModal } from "./EditTaskModal";

// Mock Obsidian Modal
vi.mock("obsidian", () => {
	// Helper to add Obsidian-like createEl method to elements recursively
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function addCreateElMethod(el: HTMLElement): any {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
		(el as any).createEl = (childTag: string) => {
			const childEl = document.createElement(childTag);
			el.appendChild(childEl);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return addCreateElMethod(childEl);
		};
		return el;
	}

	return {
		Modal: class {
			app: unknown;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contentEl: any;

			constructor(app: unknown) {
				this.app = app;
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.empty = () => { container.innerHTML = ""; };
			}

			open(): void {}
			close(): void {}
		},
	};
});

describe("EditTaskModal", () => {
	let modal: EditTaskModal;
	let mockApp: unknown;
	let onSaveSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockApp = {};
		onSaveSpy = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		modal = new EditTaskModal(mockApp as any, "Buy milk", onSaveSpy as any);
	});

	it("モーダルを開くとタスク説明入力フィールドが表示される", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		expect(input).not.toBeNull();
		expect(input.type).toBe("text");
	});

	it("入力フィールドに既存のタスク説明が初期値として設定される", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		expect(input.value).toBe("Buy milk");
	});

	it("保存ボタンが表示される", () => {
		modal.onOpen();

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		expect(saveButton).not.toBeNull();
		expect(saveButton?.textContent).toBe("保存");
	});

	it("保存ボタンをクリックするとonSaveコールバックが呼ばれる", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "Buy bread";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).toHaveBeenCalledWith("Buy bread", undefined);
	});

	it("空の入力で保存ボタンをクリックしてもonSaveが呼ばれない", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).not.toHaveBeenCalled();
	});

	it("空白のみの入力で保存ボタンをクリックしてもonSaveが呼ばれない", () => {
		modal.onOpen();

		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "   ";

		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		expect(onSaveSpy).not.toHaveBeenCalled();
	});

	it("モーダルを閉じるとコンテンツがクリアされる", () => {
		modal.onOpen();
		modal.onClose();

		expect(modal.contentEl.innerHTML).toBe("");
	});

	it("優先度ドロップダウン（なし/A-Z）が表示されること", () => {
		modal.onOpen();

		// Verify: Priority select exists
		const select = modal.contentEl.querySelector("select.priority-select");
		expect(select).not.toBeNull();

		// Verify: First option is "なし" (null value)
		const options = Array.from(select?.querySelectorAll("option") || []);
		expect(options.length).toBe(27); // なし + A-Z (26)
		expect(options[0]?.textContent).toBe("なし");
		expect((options[0] as HTMLOptionElement)?.value).toBe("");

		// Verify: A-Z options exist
		expect(options[1]?.textContent).toBe("(A)");
		expect((options[1] as HTMLOptionElement)?.value).toBe("A");
		expect(options[26]?.textContent).toBe("(Z)");
		expect((options[26] as HTMLOptionElement)?.value).toBe("Z");
	});

	it("既存の優先度が選択状態で表示されること", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		const modalWithPriority = new EditTaskModal(mockApp as any, "Buy milk", onSaveSpy as any, "B");
		modalWithPriority.onOpen();

		const select = modalWithPriority.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		expect(select.value).toBe("B");
	});

	it("優先度なしタスクの場合は「なし」が選択されること", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
		const modalNoPriority = new EditTaskModal(mockApp as any, "Buy milk", onSaveSpy as any, undefined);
		modalNoPriority.onOpen();

		const select = modalNoPriority.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		expect(select.value).toBe("");
	});

	it("選択した優先度がonSaveに渡されること", () => {
		modal.onOpen();

		// Set task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度テスト";

		// Select priority
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "A";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with priority
		expect(onSaveSpy).toHaveBeenCalledWith("優先度テスト", "A");
	});

	it("優先度「なし」を選択した場合はundefinedがonSaveに渡されること", () => {
		modal.onOpen();

		// Set task description
		const input = modal.contentEl.querySelector("input.task-description-input") as HTMLInputElement;
		input.value = "優先度なしタスク";

		// Select "なし" (value="")
		const select = modal.contentEl.querySelector("select.priority-select") as HTMLSelectElement;
		select.value = "";

		// Click save button
		const saveButton = modal.contentEl.querySelector("button.save-task-button");
		saveButton?.dispatchEvent(new Event("click"));

		// Verify: onSave was called with undefined
		expect(onSaveSpy).toHaveBeenCalledWith("優先度なしタスク", undefined);
	});
});
