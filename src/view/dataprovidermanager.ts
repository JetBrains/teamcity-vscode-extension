"use strict";

import {
    CancellationToken,
    Command,
    commands,
    Event,
    EventEmitter,
    ExtensionContext,
    ProviderResult,
    TextDocumentContentProvider,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    Uri,
    workspace
} from "vscode";
import {Disposable, window} from "vscode";
import {ProjectItem} from "../bll/entities/projectitem";
import {BuildConfigItem} from "../bll/entities/buildconfigitem";
import {CvsLocalResource} from "../bll/entities/cvslocalresource";

export class DataProviderManager {
    private static _dataProvider: TeamCityTreeDataProvider;

    public static init(disposables: Disposable[]): void {
        if (DataProviderManager._dataProvider !== undefined) {
            return;
        }
        DataProviderManager._dataProvider = new TeamCityTreeDataProvider();
        if (disposables) {
            disposables.push(window.registerTreeDataProvider("teamcityExplorer", DataProviderManager._dataProvider));
        } else {
            window.registerTreeDataProvider("teamcityExplorer", DataProviderManager._dataProvider);
        }
    }

    public static setExplorerContent(content: CvsLocalResource[] | ProjectItem[]): void {
        this._dataProvider.setExplorerContent(content);
    }

    public static refresh(): void {
        this._dataProvider.refresh();
    }

    public static getInclResources() {
        return this._dataProvider.getInclResources();
    }

    public static getIncludedBuildConfigs() {
        return this._dataProvider.getIncludedBuildConfigs();
    }
}

class TeamCityTreeDataProvider implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
    private _projects: ProjectItem[] = [];
    private _resources: CvsLocalResource[] = [];

    public refresh(config?: BuildConfigItem): void {
        if (!config) {
            this._onDidChangeTreeData.fire();
            return;
        }
        this._onDidChangeTreeData.fire();
    }

    public setExplorerContent(content: CvsLocalResource[] | ProjectItem[]) {
        if (!content || content.length === 0) {
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
     * This method determines which objects will shown inside the TeamCity Build Config section.
     * It fires every time there is a click on any element on the configExplorer.
     */
    public getChildren(element?: TreeItem): TreeItem[] | Thenable<TreeItem[]> {
        if (!element && (!this._projects || this._projects.length === 0)) {
            return this._resources;
        } else if (!element) {
            return this._projects;
        } else if (element instanceof ProjectItem) {
            return element.configs;
        }
        return [];
    }

    /**
     * @return - all included build configs for remote run.
     */
    public getIncludedBuildConfigs(): BuildConfigItem[] {
        const result: BuildConfigItem[] = [];
        this._projects.forEach((project) => {
            project.configs.forEach((configuration) => {
                if (configuration.isIncluded) {
                    result.push(configuration);
                }
            });
        });
        return result;
    }

    /**
     * @return - all included resources for remote run.
     */
    public getInclResources(): CvsLocalResource[] {
        const result: CvsLocalResource[] = [];
        this._resources.forEach((resource) => {
            if (resource.isIncluded) {
                result.push(resource);
            }
        });
        return result;
    }
}
