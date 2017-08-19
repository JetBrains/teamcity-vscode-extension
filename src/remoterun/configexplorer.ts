"use strict";

import { ProjectItem } from "../entities/projectitem";
import { CvsLocalResource, BuildConfigItem } from "../entities/leaveitems";
import { TreeItemCollapsibleState, Uri, TextDocumentContentProvider, CancellationToken, ProviderResult } from "vscode";
import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Command, Event, workspace, commands } from "vscode";

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
            return element.configs;
        }
        return [];
    }

    /**
	 * @return - all included build configs for remote run.
	 */
    public getIncludedBuildConfigs(): BuildConfigItem[] {
        const result : BuildConfigItem[] = [];
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
        const result : CvsLocalResource[] = [];
        this._resources.forEach((resource) => {
            if (resource.isIncluded) {
                result.push(resource);
            }
        });
        return result;
    }
}
