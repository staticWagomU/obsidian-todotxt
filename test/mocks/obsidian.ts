export class App {}

export class WorkspaceLeaf {
	app: App;
	constructor() {
		this.app = new App();
	}
}

export class Plugin {
	app: App;
	manifest: any;

	constructor(app: App, manifest: any) {
		this.app = app;
		this.manifest = manifest;
	}

	registerView(_viewType: string, _viewCreator: any): void {}
	registerExtensions(_extensions: string[], _viewType: string): void {}
	addRibbonIcon(_icon: string, _title: string, _callback: any): any {}
	addStatusBarItem(): any { return { setText: () => {} }; }
	addCommand(_command: any): void {}
	addSettingTab(_settingTab: any): void {}
	registerDomEvent(_el: any, _type: string, _callback: any): void {}
	registerInterval(_interval: any): void {}
	loadData(): Promise<any> { return Promise.resolve({}); }
	saveData(_data: any): Promise<void> { return Promise.resolve(); }
}

export class PluginSettingTab {
	app: App;
	plugin: any;
	containerEl: any = {};

	constructor(app: App, plugin: any) {
		this.app = app;
		this.plugin = plugin;
	}

	display(): void {}
}

export class Setting {
	constructor(_containerEl: any) {}
	setName(_name: string): this { return this; }
	setDesc(_desc: string): this { return this; }
	addText(_callback: any): this { return this; }
}

export class TextFileView {
	app: App;
	leaf: any;
	data: string = "";

	constructor(leaf: any) {
		this.leaf = leaf;
		this.app = leaf.app;
	}

	getViewType(): string { return ""; }
	getDisplayText(): string { return ""; }
	async onLoadFile(_file: any): Promise<void> {}
	async onUnloadFile(_file: any): Promise<void> {}
	getViewData(): string { return ""; }
	setViewData(_data: string, _clear: boolean): void {}
	clear(): void {}
}

export class MarkdownView {}
export class Modal {
	app: App;
	contentEl: any = {};

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
