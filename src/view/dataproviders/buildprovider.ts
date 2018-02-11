import {DataProvider} from "./dataprovider";
import {EventEmitter, TreeItem} from "vscode";
import {DataProviderEnum} from "../providermanager";
import {ProjectItem} from "../../bll/entities/projectitem";
import {Logger} from "../../bll/utils/logger";
import {BuildConfigItem} from "../../bll/entities/buildconfigitem";
import {injectable} from "inversify";
import {Project} from "../../bll/entities/project";

@injectable()
export class BuildProvider extends DataProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private projectItems: ProjectItem[] = [];

    resetTreeContent(): void {
        this.projectItems = [];
    }

    setContent(projects: Project[]): void {
        BuildProvider.clearArray(this.projectItems);
        projects.forEach((project) => this.projectItems.push(new ProjectItem(project)));
    }

    private static clearArray(array: any[]): void {
        array.length = 0;
    }

    public getSelectedContent(): BuildConfigItem[] {
        const result: BuildConfigItem[] = [];
        this.projectItems.forEach((project) => {
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

    refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.projectItems;
        } else if (element instanceof ProjectItem) {
            return element.children;
        }
        Logger.logError("A content of a Build Provider was not determined." + element);
        return [];
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.BuildsProvider;
    }
}
