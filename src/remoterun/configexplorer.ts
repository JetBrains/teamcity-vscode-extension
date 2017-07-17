import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import { VsCodeUtils } from "../utils/vscodeutils"
import * as path from 'path';

export class BuildConfig {
    private readonly _id : string;
    private readonly _label : string;
	private _isIncl : boolean = false;
	constructor(id: string, label: string) {
        this._id = id;
		this._label = label;
    };

    public get id() : string {
        return this._id;
    }

    public get label() : string {
        return this._label;
    }
	
	public get isIncl() : boolean {
        return this._isIncl;
    }

	public changeState() : void {
        this._isIncl = !this._isIncl;
    }
}

export class BuildConfigTreeDataProvider implements TreeDataProvider<BuildConfig>{
	private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
	readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
	private _configs : BuildConfig[] = [];
	
	public refresh(config?: BuildConfig): void {
		if (!config){
			this._onDidChangeTreeData.fire();
			return;
		}
		this._onDidChangeTreeData.fire();
	}

	public setConfigs(configs: BuildConfig[]){
		this._configs = configs;
	}

	public getTreeItem(config: BuildConfig): TreeItem {
		const iconName : string = "config - " + (config.isIncl ? "incl" : "excl") + ".png";
		return {
			label: config.label,
			collapsibleState: TreeItemCollapsibleState.None,
			command: {
				command: 'moveToSecondProvider',
				arguments: [config],
				title: 'Change build config group'
			},
			iconPath: {
			 	light: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName),
			 	dark: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName)
			 }
		};
	}

	/**
	 * In current implementation this method fires only one time - during the initialization of configexplorer.
	 * It detemines which objects will shown inside the TeamCity Build Config section.
	 */
	public getChildren(element?: BuildConfig): BuildConfig[] | Thenable<BuildConfig[]> {
        if (!element){
			/* values for root container */
			return this._configs;
		}
        return [];
	}

	/**
	 * @return - all included build configs for remote run.
	 */
	public getInclBuilds(): BuildConfig[] {
		let result : BuildConfig[] = [];
		for (let i = 0; i < this._configs.length; i++){
			if (this._configs[i].isIncl){
				result.push(this._configs[i]);
			}
		}
		return result;
	}
}