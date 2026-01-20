/**
 * TemplateSelectModal - テンプレート選択モーダル
 * コマンドパレットからテンプレートを選択してタスクを追加
 */

import { FuzzySuggestModal, type App } from "obsidian";
import type { TaskTemplate } from "../lib/template";
import { parseTemplate } from "../lib/template";

/**
 * テンプレート選択後のコールバック
 */
export type TemplateSelectCallback = (taskLines: string[]) => void;

/**
 * テンプレート選択モーダル
 */
export class TemplateSelectModal extends FuzzySuggestModal<TaskTemplate> {
	private templates: TaskTemplate[];
	private onSelect: TemplateSelectCallback;

	constructor(app: App, templates: TaskTemplate[], onSelect: TemplateSelectCallback) {
		super(app);
		this.templates = templates;
		this.onSelect = onSelect;
		this.setPlaceholder("テンプレートを選択...");
	}

	getItems(): TaskTemplate[] {
		return this.templates;
	}

	getItemText(item: TaskTemplate): string {
		return item.name;
	}

	onChooseItem(item: TaskTemplate, _evt: MouseEvent | KeyboardEvent): void {
		const taskLines = parseTemplate(item.content);
		this.onSelect(taskLines);
	}
}
