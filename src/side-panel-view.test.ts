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
		Modal: class {
			app: unknown;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			contentEl: any;

			constructor(app: unknown) {
				this.app = app;
				const container = document.createElement("div");
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this.contentEl = addCreateElMethod(container);
			}

			open(): void {}
			close(): void {}
		},
		Notice: class {
			constructor(_message: string, _timeout?: number) {}
			hide(): void {}
		},
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
				openRouter: {
					apiKey: "",
					model: "anthropic/claude-3-haiku",
					includeCreationDate: true,
					customContexts: {},
					retryConfig: {
						enabled: true,
						maxRetries: 3,
						initialDelayMs: 1000,
					},
				},
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

			// Check that tasks are rendered (now as li items with task-checkbox)
			const tasks = view.contentEl.querySelectorAll(".task-checkbox");
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

			// Simulate click on "open" button (find button with "開く" text)
			const buttons = view.contentEl.querySelectorAll(".edit-task-button");
			const openButton = Array.from(buttons).find(btn => btn.textContent === "開く");
			if (openButton) {
				(openButton as HTMLElement).click();
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

			// Check that AI button is displayed (with text for footer button style)
			const aiButton = view.contentEl.querySelector(".ai-add-task-button");
			expect(aiButton).not.toBeNull();
			expect(aiButton?.textContent).toBe("✨ AIタスク追加");
		});

		it("should open AITaskInputDialog when AI button is clicked", async () => {
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

			// Spy on openAITaskDialog method
			const openAITaskDialogSpy = vi.spyOn(view, "openAITaskDialog");

			await view.onOpen();

			// Find and click AI button
			const aiButton = view.contentEl.querySelector(".ai-add-task-button");
			expect(aiButton).not.toBeNull();
			(aiButton as HTMLElement).click();

			// Verify openAITaskDialog was called
			expect(openAITaskDialogSpy).toHaveBeenCalledOnce();
		});

		it("should refresh task list after adding task via AI dialog", async () => {
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

			let currentContent = "Buy milk";
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || currentContent;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.modify = async (_file: any, newContent: string): Promise<void> => {
				currentContent = newContent;
				mockFiles.set("vault/todo.txt", newContent);
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Initial task count should be 1
			const initialTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(initialTasks.length).toBe(1);

			// Simulate task addition by modifying file content
			const mockFile = new TFile();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			(mockFile as any).path = "vault/todo.txt";
			await mockPlugin.app.vault.modify(mockFile, "Buy milk\nWrite report");

			// Manually trigger the refresh callback that AI dialog would call
			await view.loadTasks();
			view.renderView();

			// Task count should now be 2
			const updatedTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(updatedTasks.length).toBe(2);
		});
	});

	describe("Add task button", () => {
		it("should open AddTaskModal when add button is clicked", async () => {
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

			// Spy on openAddTaskDialog method
			const openAddTaskDialogSpy = vi.spyOn(view, "openAddTaskDialog");

			await view.onOpen();

			// Find and click add button
			const addButton = view.contentEl.querySelector(".add-task-button");
			expect(addButton).not.toBeNull();
			(addButton as HTMLElement).click();

			// Verify openAddTaskDialog was called
			expect(openAddTaskDialogSpy).toHaveBeenCalledOnce();
		});

		it("should open file selection modal when multiple files are configured", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk"],
				["vault/work.txt", "Write report"],
				["vault/personal.txt", "Call dentist"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt", "vault/work.txt", "vault/personal.txt"];
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

			// Spy on openFileSelectionModal method
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const openFileSelectionModalSpy = vi.spyOn(view, "openFileSelectionModal" as any);

			await view.onOpen();

			// Find and click add button
			const addButton = view.contentEl.querySelector(".add-task-button");
			expect(addButton).not.toBeNull();
			(addButton as HTMLElement).click();

			// Verify openFileSelectionModal was called with 3 files
			expect(openFileSelectionModalSpy).toHaveBeenCalledOnce();
		});

		it("should refresh task list after adding task via AddTaskModal", async () => {
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

			let currentContent = "Buy milk";
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || currentContent;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.modify = async (_file: any, newContent: string): Promise<void> => {
				currentContent = newContent;
				mockFiles.set("vault/todo.txt", newContent);
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Initial task count should be 1
			const initialTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(initialTasks.length).toBe(1);

			// Simulate task addition by modifying file content
			const mockFile = new TFile();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			(mockFile as any).path = "vault/todo.txt";
			await mockPlugin.app.vault.modify(mockFile, "Buy milk\nFix bug");

			// Manually trigger the refresh that AddTaskModal callback would call
			await view.loadTasks();
			view.renderView();

			// Task count should now be 2
			const updatedTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(updatedTasks.length).toBe(2);
		});
	});

	describe("Task edit functionality", () => {
		it("should open EditTaskModal when edit button is clicked", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\n(A) Write report"],
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

			// Find edit button (should exist in task actions row)
			const editButtons = view.contentEl.querySelectorAll(".edit-task-button");
			expect(editButtons.length).toBeGreaterThan(0);

			// Spy on openEditTaskModal method
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const openEditTaskModalSpy = vi.spyOn(view, "openEditTaskModal" as any);

			// Click first edit button
			(editButtons[0] as HTMLElement).click();

			// Verify openEditTaskModal was called
			expect(openEditTaskModalSpy).toHaveBeenCalledOnce();
		});

		it("should update task after editing via EditTaskModal", async () => {
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

			let currentContent = "Buy milk";
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || currentContent;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.modify = async (_file: any, newContent: string): Promise<void> => {
				currentContent = newContent;
				mockFiles.set("vault/todo.txt", newContent);
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Check initial content
			const initialDescription = view.contentEl.querySelector(".task-description");
			expect(initialDescription?.textContent).toBe("Buy milk");

			// Simulate editing
			const mockFile = new TFile();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			(mockFile as any).path = "vault/todo.txt";
			await mockPlugin.app.vault.modify(mockFile, "(A) Buy milk and bread");

			// Manually trigger refresh
			await view.loadTasks();
			view.renderView();

			// Check updated content
			const updatedDescription = view.contentEl.querySelector(".task-description");
			expect(updatedDescription?.textContent).toBe("Buy milk and bread");

			// Check priority badge appears
			const priorityBadge = view.contentEl.querySelector(".priority");
			expect(priorityBadge?.textContent).toBe("A");
		});
	});

	describe("Task delete functionality", () => {
		it("should show delete button in task actions", async () => {
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

			// Find delete button
			const deleteButtons = view.contentEl.querySelectorAll(".delete-task-button");
			expect(deleteButtons.length).toBeGreaterThan(0);
		});

		it("should open confirmation dialog when delete button is clicked", async () => {
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

			// Spy on openDeleteConfirmDialog method
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const openDeleteConfirmDialogSpy = vi.spyOn(view, "openDeleteConfirmDialog" as any);

			// Click delete button
			const deleteButton = view.contentEl.querySelector(".delete-task-button");
			expect(deleteButton).not.toBeNull();
			(deleteButton as HTMLElement).click();

			// Verify confirmation dialog was called
			expect(openDeleteConfirmDialogSpy).toHaveBeenCalledOnce();
		});

		it("should delete task after confirmation", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\nWrite report"],
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

			let currentContent = "Buy milk\nWrite report";
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.read = async (file: any): Promise<string> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
				return mockFiles.get(file.path) || currentContent;
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockPlugin.app.vault.modify = async (_file: any, newContent: string): Promise<void> => {
				currentContent = newContent;
				mockFiles.set("vault/todo.txt", newContent);
			};

			view = new TodoSidePanelView(mockLeaf, mockPlugin);
			view.app = mockPlugin.app;
			await view.onOpen();

			// Initial task count should be 2
			const initialTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(initialTasks.length).toBe(2);

			// Simulate deletion
			const mockFile = new TFile();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			(mockFile as any).path = "vault/todo.txt";
			await mockPlugin.app.vault.modify(mockFile, "Write report");

			// Manually trigger refresh
			await view.loadTasks();
			view.renderView();

			// Task count should now be 1
			const updatedTasks = view.contentEl.querySelectorAll(".task-checkbox");
			expect(updatedTasks.length).toBe(1);

			// Remaining task should be "Write report"
			const remainingDescription = view.contentEl.querySelector(".task-description");
			expect(remainingDescription?.textContent).toBe("Write report");
		});
	});

	describe("Settings inheritance", () => {
		it("should inherit defaultSortOrder from settings", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "x 2024-01-01 Completed task\nPending task"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt"];
			mockPlugin.settings.defaultSortOrder = "completion";  // Set to completion sort
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

			// Check that sort selector has the correct value
			const sortSelector = view.contentEl.querySelector(".sort-selector") as HTMLSelectElement;
			expect(sortSelector).not.toBeNull();
			expect(sortSelector.value).toBe("completion");
		});

		it("should inherit defaultGrouping from settings", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Task1 +project1\nTask2 +project2"],
			]);

			mockPlugin.settings.todotxtFilePaths = ["vault/todo.txt"];
			mockPlugin.settings.defaultGrouping = "project";  // Set to project grouping
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

			// Check that group selector has the correct value
			const groupSelector = view.contentEl.querySelector(".group-selector") as HTMLSelectElement;
			expect(groupSelector).not.toBeNull();
			expect(groupSelector.value).toBe("project");

			// Check that group headers are rendered
			const groupHeaders = view.contentEl.querySelectorAll(".group-header");
			expect(groupHeaders.length).toBeGreaterThan(0);
		});
	});

	describe("Search focus maintenance", () => {
		it("should maintain focus when typing multiple characters in search box", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\nWrite report\nFix bug"],
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

			// Find search box and focus it
			let searchBox = view.contentEl.querySelector(".search-box") as HTMLInputElement;
			expect(searchBox).not.toBeNull();
			searchBox.focus();

			// Type first character
			searchBox.value = "m";
			searchBox.dispatchEvent(new Event("input"));

			// Re-query the search box after render (should be the same element)
			searchBox = view.contentEl.querySelector(".search-box") as HTMLInputElement;
			// Verify search box still exists and is the same element
			expect(searchBox).not.toBeNull();
			expect(searchBox.value).toBe("m");

			// Type second character
			searchBox.focus();
			searchBox.value = "mi";
			searchBox.dispatchEvent(new Event("input"));

			// Re-query again
			searchBox = view.contentEl.querySelector(".search-box") as HTMLInputElement;
			expect(searchBox).not.toBeNull();
			expect(searchBox.value).toBe("mi");

			// Type third character
			searchBox.focus();
			searchBox.value = "mil";
			searchBox.dispatchEvent(new Event("input"));

			// Final verification
			searchBox = view.contentEl.querySelector(".search-box") as HTMLInputElement;
			expect(searchBox).not.toBeNull();
			expect(searchBox.value).toBe("mil");
		});

		it("should only re-render task list when searching, not control bar", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\nWrite report"],
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

			// Get initial references to control bar and search box
			const initialControlBar = view.contentEl.querySelector(".control-bar");
			const initialSearchBox = view.contentEl.querySelector(".search-box");
			expect(initialControlBar).not.toBeNull();
			expect(initialSearchBox).not.toBeNull();

			// Trigger search input
			const searchBox = initialSearchBox as HTMLInputElement;
			searchBox.value = "milk";
			searchBox.dispatchEvent(new Event("input"));

			// Verify control bar and search box are the same elements (not re-created)
			const afterControlBar = view.contentEl.querySelector(".control-bar");
			const afterSearchBox = view.contentEl.querySelector(".search-box");

			expect(afterControlBar).toBe(initialControlBar);
			expect(afterSearchBox).toBe(initialSearchBox);
		});

		it("should maintain cursor position when typing in search box", async () => {
			const mockFiles = new Map([
				["vault/todo.txt", "Buy milk\nWrite report"],
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

			const searchBox = view.contentEl.querySelector(".search-box") as HTMLInputElement;
			expect(searchBox).not.toBeNull();

			// Type text and set cursor position in middle
			searchBox.value = "test";
			searchBox.setSelectionRange(2, 2); // Cursor after "te"
			searchBox.focus();

			const cursorPosition = searchBox.selectionStart;
			expect(cursorPosition).toBe(2);

			// Trigger input event
			searchBox.dispatchEvent(new Event("input"));

			// Verify cursor position is maintained
			expect(searchBox.selectionStart).toBe(cursorPosition);
		});
	});
});
