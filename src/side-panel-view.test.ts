import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TodoSidePanelView, VIEW_TYPE_TODO_SIDEPANEL } from "./side-panel-view";
import type TodotxtPlugin from "./main";

// Mock Obsidian modules
vi.mock("obsidian", () => {
	// Helper to add Obsidian-like createEl method to elements recursively
	// Must be defined inside the factory function due to vi.mock hoisting
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
		ItemView: class {
			leaf: unknown;
			app = {};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contentEl: any;

			constructor(leaf: unknown) {
				this.leaf = leaf;
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.empty = () => { container.innerHTML = ""; };
			}

			getViewType(): string { return ""; }
			getDisplayText(): string { return ""; }
			getIcon(): string { return ""; }
			async onOpen(): Promise<void> {}
			async onClose(): Promise<void> {}
		},
	};
});

describe("TodoSidePanelView", () => {
	let view: TodoSidePanelView;
	let mockLeaf: WorkspaceLeaf;
	let mockPlugin: TodotxtPlugin;

	beforeEach(() => {
		mockLeaf = {} as WorkspaceLeaf;
		mockPlugin = {
			settings: {
				todotxtFilePaths: [],
				defaultSortOrder: "completion",
				defaultGrouping: "none",
				showCompletedTasks: true,
			},
			app: {
				vault: {
					getAbstractFileByPath: () => null,
					read: () => Promise.resolve(""),
				},
			},
		} as unknown as TodotxtPlugin;
		view = new TodoSidePanelView(mockLeaf, mockPlugin);
	});

	it("should inherit from ItemView", () => {
		expect(typeof view.getViewType).toBe("function");
		expect(typeof view.getDisplayText).toBe("function");
		expect(typeof view.getIcon).toBe("function");
	});

	it("should return correct view type", () => {
		expect(view.getViewType()).toBe(VIEW_TYPE_TODO_SIDEPANEL);
		expect(VIEW_TYPE_TODO_SIDEPANEL).toBe("todotxt-sidepanel");
	});

	it("should return correct display text", () => {
		expect(view.getDisplayText()).toBe("Todo.txt サイドパネル");
	});

	it("should return correct icon", () => {
		expect(view.getIcon()).toBe("checkbox-glyph");
	});
});
