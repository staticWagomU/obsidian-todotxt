export class App {}

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	description: string;
	author: string;
	authorUrl: string;
	isDesktopOnly: boolean;
}

export class WorkspaceLeaf {
	app: App;
	constructor() {
		this.app = new App();
	}
}

export class Plugin {
	app: App;
	manifest: PluginManifest;

	constructor(app: App, manifest: PluginManifest) {
		this.app = app;
		this.manifest = manifest;
	}

	registerView(_viewType: string, _viewCreator?: unknown): void {}
	registerExtensions(_extensions: string[], _viewType: string): void {}
	addRibbonIcon(_icon: string, _title: string, _callback?: unknown): unknown { return {}; }
	addStatusBarItem(): { setText: () => void } { return { setText: () => {} }; }
	addCommand(_command: unknown): void {}
	addSettingTab(_settingTab: unknown): void {}
	registerDomEvent(_el: unknown, _type: string, _callback?: unknown): void {}
	registerInterval(_interval: unknown): void {}
	loadData(): Promise<Record<string, unknown>> { return Promise.resolve({}); }
	saveData(_data: unknown): Promise<void> { return Promise.resolve(); }
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: Record<string, unknown> = {};

	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
	}

	display(): void {}
}

export class Setting {
	constructor(_containerEl: unknown) {}
	setName(_name: string): this { return this; }
	setDesc(_desc: string): this { return this; }
	addText(_callback: unknown): this { return this; }
}

export class TextFileView {
	app: App;
	leaf: WorkspaceLeaf;
	data: string = "";

	constructor(leaf: WorkspaceLeaf) {
		this.leaf = leaf;
		this.app = leaf.app;
	}

	getViewType(): string { return ""; }
	getDisplayText(): string { return ""; }
	async onLoadFile(_file: unknown): Promise<void> {}
	async onUnloadFile(_file: unknown): Promise<void> {}
	getViewData(): string { return ""; }
	setViewData(_data: string, _clear: boolean): void {}
	clear(): void {}
}

export class MarkdownView {}
export class Modal {
	app: App;
	contentEl: Record<string, unknown> = {};

	constructor(app: App) {
		this.app = app;
	}

	open(): void {}
	close(): void {}
}
export class Notice {
	constructor(_message: string) {}
}
export class Editor {}
