import {Command, TreeItem, TreeItemCollapsibleState} from "vscode";

export abstract class ExpandableItem extends TreeItem {

    public get command(): Command {
        return {
            command: "changeCollapsibleState",
            arguments: [this],
            title: "Change Collapsible State"
        };
    }

    public changeCollapsibleState(): void {
        if (this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
        } else {
            this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }
    }
}
