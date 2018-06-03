import {ExpandableItem} from "./expandableitem";
import {TreeItemCollapsibleState, Uri} from "vscode";
import {Parameter} from "../Parameter";
import * as path from "path";
import {ParameterItem} from "./ParameterItem";

export class ParametersSetItem extends ExpandableItem {
    public readonly children: ParameterItem[] = [];

    constructor(label: string, private readonly params: Parameter[]) {
        super(label, TreeItemCollapsibleState.Expanded);

        params.forEach((param) => {
            this.children.push(new ParameterItem(param));
        });
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "project.svg";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }
}
