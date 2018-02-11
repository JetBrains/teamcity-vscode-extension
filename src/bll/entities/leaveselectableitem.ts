import {Command, TreeItem, TreeItemCollapsibleState} from "vscode";

export abstract class LeaveSelectableItem extends TreeItem {
    private _isIncluded: boolean;

    constructor(label: string, isIncluded: boolean = false) {
        super(label, TreeItemCollapsibleState.None);
        this._isIncluded = isIncluded;
    }

    public get command(): Command {
        return {
            command: "changeConfigState",
            arguments: [this],
            title: "Change build config group"
        };
    }

    public get isIncluded(): boolean {
        return this._isIncluded;
    }

    public changeState(): void {
        this._isIncluded = !this._isIncluded;
    }
}
