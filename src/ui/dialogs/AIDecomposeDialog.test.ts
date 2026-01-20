/**
 * AIDecomposeDialog tests
 * PBI-067 AC5: カスタム指示を入力してAIの分解方針を調整できる
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
}));

describe("AIDecomposeDialog", () => {
	it("AIDecomposeDialogクラスが存在する", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		expect(AIDecomposeDialog).toBeDefined();
	});

	it("コンストラクタでタスク説明とコールバックを受け取る", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const taskDescription = "大きなプロジェクトを完了する";
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			taskDescription,
			onSubmit,
		);
		expect(dialog).toBeDefined();
	});

	it("getCustomInstruction()でカスタム指示を取得できる", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			"タスク",
			onSubmit,
		);
		// 初期値は空文字
		expect(dialog.getCustomInstruction()).toBe("");
	});

	it("setCustomInstruction()でカスタム指示を設定できる", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			"タスク",
			onSubmit,
		);
		
		dialog.setCustomInstruction("技術的な観点で分解してください");
		expect(dialog.getCustomInstruction()).toBe("技術的な観点で分解してください");
	});

	it("onSubmitコールバックがカスタム指示を渡す", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			"タスク",
			onSubmit,
		);
		
		dialog.setCustomInstruction("詳細なステップに分解");
		dialog.triggerSubmit();
		
		expect(onSubmit).toHaveBeenCalledWith("詳細なステップに分解");
	});

	it("カスタム指示が空でもonSubmitが呼ばれる", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			"タスク",
			onSubmit,
		);
		
		dialog.triggerSubmit();
		
		expect(onSubmit).toHaveBeenCalledWith("");
	});

	it("getTaskDescription()でタスク説明を取得できる", async () => {
		const { AIDecomposeDialog } = await import("./AIDecomposeDialog");
		const mockApp = { vault: {} };
		const onSubmit = vi.fn();

		const dialog = new AIDecomposeDialog(
			mockApp as any,
			"大きなプロジェクトを完了する +work @office",
			onSubmit,
		);
		
		expect(dialog.getTaskDescription()).toBe("大きなプロジェクトを完了する +work @office");
	});
});
