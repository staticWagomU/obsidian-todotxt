/**
 * TaskContextMenu - コンテキストメニュー基盤クラス
 * Obsidian Menu APIを使用したコンテキストメニュー実装
 * Sprint 63 - PBI-061: AC1対応
 */

import { Menu } from "obsidian";
import type { Todo } from "../lib/todo";

/**
 * コンテキストメニューのコールバック型定義
 */
export interface ContextMenuCallbacks {
	onEdit: (index: number) => void;
	onDelete: (index: number) => Promise<void>;
	onDuplicate: (index: number) => void;
	onPriorityChange: (index: number, priority: string | undefined) => void;
	onProjectChange: (index: number, project: string, action: "add" | "remove") => void;
	onContextChange: (index: number, context: string, action: "add" | "remove") => void;
}

/**
 * メニュー項目情報（テスト用）
 */
export interface MenuItemInfo {
	title: string;
	icon?: string;
	hasSubmenu?: boolean;
}

/**
 * TaskContextMenu - タスクのコンテキストメニュークラス
 */
export class TaskContextMenu {
	private menu: Menu;
	private todo: Todo;
	private index: number;
	private callbacks: ContextMenuCallbacks;
	private menuItems: MenuItemInfo[] = [];
	private allProjects: string[];
	private allContexts: string[];

	constructor(
		todo: Todo,
		index: number,
		callbacks: ContextMenuCallbacks,
		allProjects: string[] = [],
		allContexts: string[] = [],
	) {
		this.todo = todo;
		this.index = index;
		this.callbacks = callbacks;
		this.allProjects = allProjects;
		this.allContexts = allContexts;
		this.menu = new Menu();
		this.buildMenu();
	}

	/**
	 * メニューを構築
	 */
	private buildMenu(): void {
		// 編集
		this.menu.addItem((item) => {
			item.setTitle("編集")
				.setIcon("pencil")
				.onClick(() => {
					this.callbacks.onEdit(this.index);
				});
		});
		this.menuItems.push({ title: "編集", icon: "pencil" });

		// 複製
		this.menu.addItem((item) => {
			item.setTitle("複製")
				.setIcon("copy")
				.onClick(() => {
					this.callbacks.onDuplicate(this.index);
				});
		});
		this.menuItems.push({ title: "複製", icon: "copy" });

		// 削除
		this.menu.addItem((item) => {
			item.setTitle("削除")
				.setIcon("trash")
				.onClick(() => {
					void this.callbacks.onDelete(this.index);
				});
		});
		this.menuItems.push({ title: "削除", icon: "trash" });

		this.menu.addSeparator();

		// 優先度変更サブメニュー
		this.menu.addItem((item) => {
			item.setTitle("優先度変更")
				.setIcon("arrow-up-narrow-wide");
			const submenu = item.setSubmenu();
			this.buildPrioritySubmenu(submenu);
		});
		this.menuItems.push({ title: "優先度変更", icon: "arrow-up-narrow-wide", hasSubmenu: true });

		this.menu.addSeparator();

		// プロジェクトサブメニュー
		this.menu.addItem((item) => {
			item.setTitle("プロジェクト")
				.setIcon("folder");
			const submenu = item.setSubmenu();
			this.buildProjectSubmenu(submenu);
		});
		this.menuItems.push({ title: "プロジェクト", icon: "folder", hasSubmenu: true });

		// コンテキストサブメニュー
		this.menu.addItem((item) => {
			item.setTitle("コンテキスト")
				.setIcon("at-sign");
			const submenu = item.setSubmenu();
			this.buildContextSubmenu(submenu);
		});
		this.menuItems.push({ title: "コンテキスト", icon: "at-sign", hasSubmenu: true });
	}

	/**
	 * 優先度変更サブメニューを構築
	 */
	private buildPrioritySubmenu(submenu: Menu): void {
		// 優先度なし
		submenu.addItem((item) => {
			item.setTitle("優先度なし")
				.onClick(() => {
					this.callbacks.onPriorityChange(this.index, undefined);
				});
			if (!this.todo.priority) {
				item.setIcon("check");
			}
		});

		submenu.addSeparator();

		// A-Z
		for (let i = 65; i <= 90; i++) {
			const letter = String.fromCharCode(i);
			submenu.addItem((item) => {
				item.setTitle(`(${letter})`)
					.onClick(() => {
						this.callbacks.onPriorityChange(this.index, letter);
					});
				if (this.todo.priority === letter) {
					item.setIcon("check");
				}
			});
		}
	}

	/**
	 * プロジェクトサブメニューを構築
	 */
	private buildProjectSubmenu(submenu: Menu): void {
		const currentProjects = new Set(this.todo.projects);

		// 現在のプロジェクト（削除用）
		if (currentProjects.size > 0) {
			submenu.addItem((item) => {
				item.setTitle("--- 現在のプロジェクト ---")
					.setSection("current");
			});

			for (const project of currentProjects) {
				submenu.addItem((item) => {
					item.setTitle(`+${project}`)
						.setIcon("minus")
						.onClick(() => {
							this.callbacks.onProjectChange(this.index, project, "remove");
						});
				});
			}

			submenu.addSeparator();
		}

		// 追加可能なプロジェクト
		const availableProjects = this.allProjects.filter(p => !currentProjects.has(p));
		if (availableProjects.length > 0) {
			submenu.addItem((item) => {
				item.setTitle("--- 追加 ---")
					.setSection("add");
			});

			for (const project of availableProjects) {
				submenu.addItem((item) => {
					item.setTitle(`+${project}`)
						.setIcon("plus")
						.onClick(() => {
							this.callbacks.onProjectChange(this.index, project, "add");
						});
				});
			}
		}
	}

	/**
	 * コンテキストサブメニューを構築
	 */
	private buildContextSubmenu(submenu: Menu): void {
		const currentContexts = new Set(this.todo.contexts);

		// 現在のコンテキスト（削除用）
		if (currentContexts.size > 0) {
			submenu.addItem((item) => {
				item.setTitle("--- 現在のコンテキスト ---")
					.setSection("current");
			});

			for (const context of currentContexts) {
				submenu.addItem((item) => {
					item.setTitle(`@${context}`)
						.setIcon("minus")
						.onClick(() => {
							this.callbacks.onContextChange(this.index, context, "remove");
						});
				});
			}

			submenu.addSeparator();
		}

		// 追加可能なコンテキスト
		const availableContexts = this.allContexts.filter(c => !currentContexts.has(c));
		if (availableContexts.length > 0) {
			submenu.addItem((item) => {
				item.setTitle("--- 追加 ---")
					.setSection("add");
			});

			for (const context of availableContexts) {
				submenu.addItem((item) => {
					item.setTitle(`@${context}`)
						.setIcon("plus")
						.onClick(() => {
							this.callbacks.onContextChange(this.index, context, "add");
						});
				});
			}
		}
	}

	/**
	 * 指定位置にメニューを表示
	 */
	showAtPosition(position: { x: number; y: number }): void {
		this.menu.showAtPosition(position);
	}

	/**
	 * マウスイベントの位置にメニューを表示
	 */
	showAtMouseEvent(event: MouseEvent): void {
		this.menu.showAtMouseEvent(event);
	}

	/**
	 * メニューを閉じる
	 */
	close(): void {
		this.menu.close();
	}

	/**
	 * テスト用: メニュー項目を取得
	 */
	getMenuItems(): MenuItemInfo[] {
		return this.menuItems;
	}
}
