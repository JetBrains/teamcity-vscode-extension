import {DataProvider} from "./dataprovider";
import {EventEmitter, TreeItem} from "vscode";
import {ProjectItem} from "../../bll/entities/presentable/projectitem";
import {Logger} from "../../bll/utils/logger";
import {BuildConfigItem} from "../../bll/entities/presentable/buildconfigitem";
import {injectable} from "inversify";
import {Project} from "../../bll/entities/project";
import {DataProviderEnum} from "../../bll/utils/constants";
import {IBuildProvider} from "./interfaces/ibuildprovider";
import {BuildConfig} from "../../bll/entities/buildconfig";

@injectable()
export class BuildProvider extends DataProvider implements IBuildProvider {
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

    public getSelectedContent(): BuildConfig[] {
        const result: BuildConfig[] = [];
        this.projectItems.forEach((project) => {
            this.collectAllProject(project, result);
        });

        return result;
    }

    private collectAllProject(project: ProjectItem, summaryCollection: BuildConfig[]) {
        project.children.forEach((child) => {
            if (child instanceof BuildConfigItem && child.isIncluded) {
                summaryCollection.push(child.entity);
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
