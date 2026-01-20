/**
 * AIDecomposePreviewDialog tests
 * PBI-067 AC4: プレビュー画面で編集してから追加できる
 */

import { describe, it, expect, vi } from "vitest";

// Mock Obsidian Modal
vi.mock("obsidian", () => ({
	Modal: class {
		app: unknown;
		contentEl = {
			empty: vi.fn(),
			addClass: vi.fn(),
			createEl: vi.fn().mockReturnValue({
				createEl: vi.fn().mockReturnThis(),
				value: "",
			}),
			createDiv: vi.fn().mockReturnValue({
				createEl: vi.fn().mockReturnThis(),
			}),
		};
		constructor(app: unknown) {
			this.app = app;
		}
		open() {}
		close() {}
	},
	Notice: vi.fn(),
	TFile: class {},
}));

describe("AIDecomposePreviewDialog", () => {
	it("AIDecomposePreviewDialogクラスが存在する", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		expect(AIDecomposePreviewDialog).toBeDefined();
	});

	it("コンストラクタでサブタスク配列とコールバックを受け取る", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		const mockApp = { vault: {} };
		const subtaskLines = ["サブタスク1", "サブタスク2"];
		const onConfirm = vi.fn();

		const dialog = new AIDecomposePreviewDialog(
			mockApp as any,
			subtaskLines,
			onConfirm,
		);
		expect(dialog).toBeDefined();
	});

	it("getSubtaskLines()でサブタスク配列を取得できる", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		const mockApp = { vault: {} };
		const subtaskLines = ["サブタスク1", "サブタスク2", "サブタスク3"];
		const onConfirm = vi.fn();

		const dialog = new AIDecomposePreviewDialog(
			mockApp as any,
			subtaskLines,
			onConfirm,
		);
		expect(dialog.getSubtaskLines()).toEqual(subtaskLines);
	});

	it("setSubtaskLines()でサブタスク配列を更新できる", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		const mockApp = { vault: {} };
		const subtaskLines = ["サブタスク1"];
		const onConfirm = vi.fn();

		const dialog = new AIDecomposePreviewDialog(
			mockApp as any,
			subtaskLines,
			onConfirm,
		);
		
		const newSubtasks = ["新しいサブタスク1", "新しいサブタスク2"];
		dialog.setSubtaskLines(newSubtasks);
		expect(dialog.getSubtaskLines()).toEqual(newSubtasks);
	});

	it("onConfirmコールバックが呼び出される", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		const mockApp = { vault: {} };
		const subtaskLines = ["サブタスク1"];
		const onConfirm = vi.fn();

		const dialog = new AIDecomposePreviewDialog(
			mockApp as any,
			subtaskLines,
			onConfirm,
		);
		
		// handleConfirmをシミュレート
		dialog.triggerConfirm();
		expect(onConfirm).toHaveBeenCalledWith(subtaskLines);
	});

	it("編集後のサブタスクでonConfirmが呼ばれる", async () => {
		const { AIDecomposePreviewDialog } = await import("./AIDecomposePreviewDialog");
		const mockApp = { vault: {} };
		const subtaskLines = ["サブタスク1"];
		const onConfirm = vi.fn();

		const dialog = new AIDecomposePreviewDialog(
			mockApp as any,
			subtaskLines,
			onConfirm,
		);
		
		// 編集後
		const editedSubtasks = ["編集後のサブタスク1", "追加されたサブタスク2"];
		dialog.setSubtaskLines(editedSubtasks);
		dialog.triggerConfirm();
		
		expect(onConfirm).toHaveBeenCalledWith(editedSubtasks);
	});
});
