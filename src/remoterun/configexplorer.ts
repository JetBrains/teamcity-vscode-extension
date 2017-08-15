import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Command, Event, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from "vscode";
import { CvsLocalResource } from "../entities/cvsresource";
import * as path from "path";

export abstract class LeaveSelectableItem extends TreeItem {
    private _isIncl : boolean;
    constructor(label: string, isIncl: boolean = false) {
        super(label, TreeItemCollapsibleState.None);
        this._isIncl = isIncl;
    }
    public get command() : Command {
        return {
            command: "changeConfigState",
            arguments: [this],
            title: "Change build config group"
        };
    }

    public get isIncl() : boolean {
        return this._isIncl;
    }

    public changeState() : void {
        this._isIncl = !this._isIncl;
    }
}

export class BuildConfigItem extends LeaveSelectableItem {
    private readonly _id : string;
    private readonly _externalId : string;
    constructor(id: string, externalId : string, label: string) {
        super(label, false);
        this._id = id;
        this._externalId = externalId;
    }

    public get iconPath() : string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName : string = "config - " + (this.isIncl ? "incl" : "excl") + ".png";
        return {
            light: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName)
        };
    }

    public get id() : string {
        return this._id;
    }

    public get externalId() : string {
        return this._externalId;
    }
}

export class ProjectItem extends TreeItem {
    public configs : BuildConfigItem[];

    constructor(label: string, configs: BuildConfigItem[]) {
        super(label, TreeItemCollapsibleState.Collapsed);
        this.configs = configs;
    }

    public get iconPath() : string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName : string = "project.png";
        return {
            light: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName)
        };
    }

    public get command() : Command {
        return {
            command: "changeCollapsibleState",
            arguments: [this],
            title: "Change Collapsible State"
        };
    }

    public changeCollapsibleState() : void {
        if (this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
        }else {
            this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }
    }
}

export class BuildConfigTreeDataProvider implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
    private _projects : ProjectItem[] = [];
    private _resources : CvsLocalResource[] = [];

    public refresh(config?: BuildConfigItem): void {
        if (!config) {
            this._onDidChangeTreeData.fire();
            return;
        }
        this._onDidChangeTreeData.fire();
    }

    public setExplorerContent(content: CvsLocalResource[] | ProjectItem[]) {
        if (!content || content.length ===  0) {
            this.setProjects([]);
            this.setResources([]);
            return;
        }
        if (content[0] instanceof ProjectItem) {
            this.setResources([]);
            this.setProjects(<ProjectItem[]>content);
        } else {
            this.setProjects([]);
            this.setResources(<CvsLocalResource[]>content);
        }
    }

    private setResources(resources: CvsLocalResource[]) {
        this._resources = resources;
    }

    private setProjects(projects: ProjectItem[]) {
        this._projects = projects;
    }

    public getTreeItem(treeItem: TreeItem): TreeItem {
        return treeItem;
    }

    /**
	 * This method detemines which objects will shown inside the TeamCity Build Config section.
     * It fires every time there is a click on any element on the configExlorer.
	 */
    public getChildren(element?: TreeItem): TreeItem[] | Thenable<TreeItem[]> {
        if (!element && (!this._projects || this._projects.length === 0) ) {
            return this._resources;
        } else if (!element) {
            return this._projects;
        } else if (element instanceof ProjectItem) {
            const project : ProjectItem = element;
            return element.configs;
        }
        return [];
    }

    /**
	 * @return - all included build configs for remote run.
	 */
    public getInclBuilds(): BuildConfigItem[] {
        const result : BuildConfigItem[] = [];
        this._projects.forEach((project) => {
            project.configs.forEach((config) => {
                if (config.isIncl) {
                    result.push(config);
                }
            });
        });
        return result;
    }

    /**
	 * @return - all included resources for remote run.
	 */
    public getInclResources(): CvsLocalResource[] {
        const result : CvsLocalResource[] = [];
        this._resources.forEach((resource) => {
            if (resource.isIncl) {
                result.push(resource);
            }
        });
        return result;
    }
}
