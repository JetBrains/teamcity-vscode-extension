import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import {Change} from "../change";
import {Utils} from "../../utils/utils";
import {ImageConstants} from "../imageconstants";

export class ChangeItem extends TreeItem {

    constructor(private readonly change: Change) {
        super(Utils.formChangeLabel(change).replace("\n", " | "), TreeItemCollapsibleState.None);
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        return {
            light: ImageConstants.makeChangesImage(this.change.status, this.change.isPersonal, false),
            dark: ImageConstants.makeChangesImage(this.change.status, this.change.isPersonal, true)
        };
    }

    public get item(): Change {
        return this.change;
    }
}
