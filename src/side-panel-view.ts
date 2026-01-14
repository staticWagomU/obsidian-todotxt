import { ItemView, type WorkspaceLeaf } from "obsidian";
import type TodotxtPlugin from "./main";

export const VIEW_TYPE_TODO_SIDEPANEL = "todotxt-sidepanel";

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
		// To be implemented
	}

	async onClose(): Promise<void> {
		// Cleanup
	}
}
