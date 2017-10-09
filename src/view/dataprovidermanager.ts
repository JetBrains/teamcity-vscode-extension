"use strict";

import {
    CancellationToken,
    commands,
    Disposable,
    Event,
    EventEmitter,
    ExtensionContext,
    ProviderResult,
    TextDocumentContentProvider,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    Uri,
    window,
    workspace
} from "vscode";
import {ProjectItem} from "../bll/entities/projectitem";
import {BuildConfigItem} from "../bll/entities/buildconfigitem";
import {CvsLocalResource} from "../bll/entities/cvslocalresource";
import {CheckInInfo} from "../bll/remoterun/checkininfo";
import {isNullOrUndefined} from "util";

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

    public static storeCheckInInfo(content: CheckInInfo): void {
        this._dataProvider.storeCheckInInfo(content);
    }

    public static resetExplorerContentAndRefresh(): void {
        this._dataProvider.setExplorerContent(undefined);
        this._dataProvider.setExplorerContent([]);
        this._dataProvider.refresh();
    }

    public static setExplorerContentAndRefresh(content: CheckInInfo | ProjectItem[]): void {
        this._dataProvider.setExplorerContent(content);
        DataProviderManager.refresh();
    }

    public static refresh(): void {
        this._dataProvider.refresh();
    }

    public static getCheckInInfoWithIncludedResources() {
        return this._dataProvider.getCheckInInfoWithIncludedResources();
    }

    public static getIncludedBuildConfigs() {
        return this._dataProvider.getIncludedBuildConfigs();
    }
}

class TeamCityTreeDataProvider implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
    private projects: ProjectItem[] = [];
    private checkInInfo: CheckInInfo;

    public refresh(config?: BuildConfigItem): void {
        if (!config) {
            this._onDidChangeTreeData.fire();
            return;
        }
        this._onDidChangeTreeData.fire();
    }

    public setExplorerContent(content: CheckInInfo | ProjectItem[], shouldReset: boolean = true) {
        if (!content) {
            this.projects = [];
            this.checkInInfo = undefined;
            return;
        }
        if (content instanceof Array) {
            this.resetCheckInInfoIfRequired(shouldReset);
            this.projects = content;
        } else {
            this.resetProjectsIfRequired(shouldReset);
            this.checkInInfo = <CheckInInfo>content;
        }
    }

    private resetCheckInInfoIfRequired(shouldReset: boolean) {
        if (shouldReset) {
            this.checkInInfo = undefined;
        }
    }

    private resetProjectsIfRequired(shouldReset: boolean) {
        if (shouldReset) {
            this.projects = [];
        }
    }

    public storeCheckInInfo(content: CheckInInfo) {
        const shouldReset = false;
        this.setExplorerContent(content, shouldReset);
    }

    public getTreeItem(treeItem: TreeItem): TreeItem {
        return treeItem;
    }

    /**
     * This method determines which objects will shown inside the TeamCity Build Config section.
     * It fires every time there is a click on any element on the configExplorer.
     */
    public getChildren(element?: TreeItem): TreeItem[] | Thenable<TreeItem[]> {
        if (!element && (!this.projects || this.projects.length === 0)) {
            return this.checkInInfo ? this.checkInInfo.cvsLocalResources : [];
        } else if (!element) {
            return this.projects;
        } else if (element instanceof ProjectItem) {
            return element.children;
        }
        return [];
    }

    /**
     * @return - all included build configs for remote run.
     */
    public getIncludedBuildConfigs(): BuildConfigItem[] {
        const result: BuildConfigItem[] = [];
        this.projects.forEach((project) => {
            this.collectAllProject(project, result);
        });

        return result;
    }

    private collectAllProject(project: ProjectItem, summaryCollection: BuildConfigItem[]) {
        project.children.forEach((child) => {
            if (child instanceof BuildConfigItem && child.isIncluded) {
                summaryCollection.push(child);
            }
            if (child instanceof ProjectItem) {
                this.collectAllProject(child, summaryCollection);
            }
        });
    }

    public getCheckInInfoWithIncludedResources(): CheckInInfo {
        const result: CheckInInfo = this.checkInInfo;
        if (!result) {
            return undefined;
        }
        const includedResources: CvsLocalResource[] = [];
        const localResources: CvsLocalResource[] = this.checkInInfo.cvsLocalResources;
        localResources.forEach((resource) => {
            if (resource.isIncluded) {
                includedResources.push(resource);
            }
        });
        result.cvsLocalResources = includedResources;
        return result;
    }
}
