import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorkspaceLeaf } from "obsidian";
import { TFile } from "obsidian";
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

	// Mock TFile class
	class TFile {
		path: string;
		stat: { mtime: number };
		constructor(path: string) {
			this.path = path;
			this.stat = { mtime: Date.now() };
		}
	}

	return {
		TFile,
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
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				this.contentEl.createDiv = (cls?: string) => {
					const div = document.createElement("div");
					if (cls) div.className = cls;
					container.appendChild(div);
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const wrappedDiv = addCreateElMethod(div);
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					wrappedDiv.createDiv = (innerCls?: string) => {
						const innerDiv = document.createElement("div");
						if (innerCls) innerDiv.className = innerCls;
						div.appendChild(innerDiv);
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return addCreateElMethod(innerDiv);
					};
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return wrappedDiv;
				};
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

	describe("Task list rendering", () => {
		it("should load tasks from configured todo.txt files", async () => {
			// Setup mock files
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\nWrite report +work"],
				["vault/work.txt", "(A) Important task @office"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt", "vault/work.txt"];
			mockPlugin.app.vault.getAbstractFileByPath = (path: string) => {
				if (mockFiles.has(path)) {
					const file = new TFile();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
					(file as any).path = path;
					return file;
				}
				return null;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || "";
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Check that tasks are rendered
			const tasks = view.contentEl.querySelectorAll(".todotxt-task");
			expect(tasks.length).toBe(3);
		});

		it("should handle click on task to open corresponding file", async () => {
			const mockOpenFile = vi.fn();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			mockPlugin.app.workspace = {
				openLinkText: mockOpenFile,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any;

			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt"];
			mockPlugin.app.vault.getAbstractFileByPath = (path: string) => {
				if (mockFiles.has(path)) {
					const file = new TFile();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
					(file as any).path = path;
					return file;
				}
				return null;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || "";
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Simulate click on task
			const taskElement = view.contentEl.querySelector(".todotxt-task");
			if (taskElement) {
				(taskElement as HTMLElement).click();
			}

			// Verify file was opened
			expect(mockOpenFile).toHaveBeenCalledWith("vault/todo.txt", "", false);
		});
	});

	describe("AI task addition button", () => {
		it("should display AI task addition button in side panel", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt"];
			mockPlugin.app.vault.getAbstractFileByPath = (path: string) => {
				if (mockFiles.has(path)) {
					const file = new TFile();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
					(file as any).path = path;
					return file;
				}
				return null;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || "";
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Check that AI button is displayed
			const aiButton = view.contentEl.querySelector(".ai-add-task-button");
			expect(aiButton).not.toBeNull();
			expect(aiButton?.textContent).toContain("AI");
		});
	});
});
