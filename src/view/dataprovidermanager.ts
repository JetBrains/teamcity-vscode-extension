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
import {CvsLocalResource} from "../bll/entities/cvsresources/cvslocalresource";
import {CheckInInfo} from "../bll/entities/checkininfo";

export class DataProviderManager {
    private static dataProvider: TeamCityTreeDataProvider;
    private static checkInArray: CheckInInfo[] = [];

    public static init(disposables: Disposable[]): void {
        if (DataProviderManager.dataProvider !== undefined) {
            return;
        }
        DataProviderManager.dataProvider = new TeamCityTreeDataProvider();
        if (disposables) {
            disposables.push(window.registerTreeDataProvider("teamcityExplorer", DataProviderManager.dataProvider));
        } else {
            window.registerTreeDataProvider("teamcityExplorer", DataProviderManager.dataProvider);
        }
    }

    public static storeCheckInArray(checkInArray: CheckInInfo[]): void {
        this.checkInArray = checkInArray;
    }

    public static getStoredCheckInArray(): CheckInInfo[] {
        return this.checkInArray;
    }

    public static resetExplorerContentAndRefresh(): void {
        this.dataProvider.setExplorerContent([]);
        DataProviderManager.refresh();
    }

    public static setExplorerContentAndRefresh(content: CheckInInfo[] | ProjectItem[]): void {
        this.dataProvider.setExplorerContent(content);
        DataProviderManager.refresh();
    }

    public static refresh(): void {
        this.dataProvider.refresh();
    }

    public static getCheckInArraysWithIncludedResources() {
        return this.dataProvider.getCheckInArraysWithIncludedResources();
    }

    public static getIncludedBuildConfigs() {
        return this.dataProvider.getIncludedBuildConfigs();
    }
}

class TeamCityTreeDataProvider implements TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
    private projects: ProjectItem[] = [];
    private checkInArray: CheckInInfo[] = [];

    public refresh(config?: BuildConfigItem): void {
        if (!config) {
            this._onDidChangeTreeData.fire();
            return;
        }
        this._onDidChangeTreeData.fire();
    }

    public setExplorerContent(content: CheckInInfo[] | ProjectItem[], shouldReset: boolean = true) {
        if (!content && content.length === 0) {
            this.projects = [];
            this.checkInArray = [];
            return;
        }
        if (content[0] instanceof ProjectItem) {
            this.resetCheckInInfoIfRequired(shouldReset);
            this.projects = <ProjectItem[]>content;
        } else {
            this.resetProjectsIfRequired(shouldReset);
            this.checkInArray = <CheckInInfo[]>content;
        }
    }

    private resetCheckInInfoIfRequired(shouldReset: boolean) {
        if (shouldReset) {
            this.checkInArray = undefined;
        }
    }

    private resetProjectsIfRequired(shouldReset: boolean) {
        if (shouldReset) {
            this.projects = [];
        }
    }

    public storeCheckInInfo(content: CheckInInfo[]) {
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
            return this.checkInArray;
        } else if (!element) {
            return this.projects;
        } else if (element instanceof ProjectItem) {
            return element.children;
        } else if (element instanceof CheckInInfo) {
            return element.cvsLocalResources;
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

    public getCheckInArraysWithIncludedResources(): CheckInInfo[] {
        const result: CheckInInfo[] = [];
        this.checkInArray.forEach((checkInInfo) => {
            result.push(this.getCheckInInfoWithIncludedResources(checkInInfo));
        });
        return result;
    }

    private getCheckInInfoWithIncludedResources(checkInInfo: CheckInInfo): CheckInInfo {
        const result: CheckInInfo = checkInInfo;
        const includedResources: CvsLocalResource[] = [];
        const localResources: CvsLocalResource[] = checkInInfo.cvsLocalResources;
        localResources.forEach((resource) => {
            if (resource.isIncluded) {
                includedResources.push(resource);
            }
        });
        result.cvsLocalResources = includedResources;
        return result;
    }
}
