import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import {Change} from "../change";
import {Utils} from "../../utils/utils";
import * as path from "path";

export class ChangeItem extends TreeItem {

    private readonly change: Change;

    constructor(change: Change) {
        super(Utils.formChangeLabel(change).replace("\n", " | "), TreeItemCollapsibleState.None);
        this.change = change;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "change.svg";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public get item(): Change {
        return this.change;
    }
}
