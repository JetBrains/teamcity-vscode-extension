import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import * as path from "path";
import {Parameter} from "../Parameter";

export class ParameterItem extends TreeItem {
    constructor(param: Parameter) {
        const label = `${param.key}  =  ${param.value}`;
        super(label, TreeItemCollapsibleState.None);
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "status-A.svg";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }
}
