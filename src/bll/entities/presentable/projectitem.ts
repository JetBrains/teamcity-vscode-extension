import * as path from "path";
import {BuildConfigItem} from "./buildconfigitem";
import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import {Project} from "../project";
import {BuildConfig} from "../buildconfig";
import {ExpandableItem} from "./expandableitem";

export class ProjectItem extends ExpandableItem {
    public children: TreeItem[] = [];

    constructor(project: Project) {
        super(project.name, TreeItemCollapsibleState.Collapsed);
        project.children.forEach((child) => {
           if (child instanceof Project) {
               this.children.push(new ProjectItem(child));
           } else if (child instanceof BuildConfig) {
               this.children.push(new BuildConfigItem(child));
           }
        });
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "project.svg";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public addChildProject(project: ProjectItem) {
        this.children.push(project);
    }
}
