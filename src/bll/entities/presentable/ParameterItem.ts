import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import * as path from "path";
import {Parameter} from "../Parameter";

export class ParameterItem extends TreeItem {

    constructor(private readonly parameter: Parameter) {
        super(`${parameter.key}  =  ${parameter.value}`, TreeItemCollapsibleState.None);
        this.contextValue = "parameterItem";
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "status-Added.svg";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public get item(): Parameter {
        return this.parameter;
    }
}
