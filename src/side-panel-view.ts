import { ItemView, type WorkspaceLeaf, TFile } from "obsidian";
import type TodotxtPlugin from "./main";
import { parseTodoTxt } from "./lib/parser";

export const VIEW_TYPE_TODO_SIDEPANEL = "todotxt-sidepanel";

interface TaskWithFile {
	description: string;
	filePath: string;
	lineIndex: number;
}

export class TodoSidePanelView extends ItemView {
	plugin: TodotxtPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: TodotxtPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_TODO_SIDEPANEL;
	}

	getDisplayText(): string {
		return "Todo.txt サイドパネル";
	}

	getIcon(): string {
		return "checkbox-glyph";
	}

	async onOpen(): Promise<void> {
		await this.renderTaskList();
	}

	async onClose(): Promise<void> {
		// Cleanup
	}

	/**
	 * Render task list from all configured todo.txt files
	 */
	async renderTaskList(): Promise<void> {
		this.contentEl.empty();

		const tasks: TaskWithFile[] = [];
		const filePaths = this.plugin.settings.todotxtFilePaths;

		// Load tasks from each configured file
		for (const filePath of filePaths) {
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file instanceof TFile) {
				const content = await this.app.vault.read(file);
				const todos = parseTodoTxt(content);

				todos.forEach((todo, index) => {
					tasks.push({
						description: todo.description,
						filePath: file.path,
						lineIndex: index,
					});
				});
			}
		}

		// Render AI add button
		this.renderAIAddButton();

		// Render tasks
		const container = this.contentEl.createDiv("todotxt-sidepanel-container");
		tasks.forEach((task) => {
			const taskEl = container.createDiv("todotxt-task");
			taskEl.textContent = task.description;
			taskEl.addEventListener("click", () => {
				void this.openFile(task.filePath);
			});
		});
	}

	/**
	 * Render AI task addition button (placeholder for PBI-047)
	 */
	renderAIAddButton(): void {
		const aiButton = this.contentEl.createEl("button");
		aiButton.classList.add("ai-add-task-button");
		aiButton.textContent = "AI追加";
		aiButton.addEventListener("click", () => {
			// Placeholder: Will be implemented in PBI-047
			console.log("AI task addition (coming in PBI-047)");
		});
	}

	/**
	 * Open file in workspace
	 */
	async openFile(filePath: string): Promise<void> {
		await this.app.workspace.openLinkText(filePath, "", false);
	}
}
