import {Command, TreeItem, TreeItemCollapsibleState} from "vscode";

export abstract class ExpandableItem extends TreeItem {

    public readonly command = this.preCommandProcessing;

    private get preCommandProcessing(): Command {
        if (this.hasChildren() && this.collapsibleState === TreeItemCollapsibleState.None) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
        }

        return undefined;
    }

    public hasChildren(): boolean {
        return true;
    }
}
