import {TreeItem, TreeItemCollapsibleState} from "vscode";
import {ExpandableItem} from "./expandableitem";
import {TimePeriod} from "../timeperiod";
import {ChangeItem} from "./changeitem";

export class TimePeriodItem extends ExpandableItem {
    public children: TreeItem[] = [];

    constructor(timePeriod: TimePeriod) {
        super(timePeriod.timePeriod, TreeItemCollapsibleState.Collapsed);
        timePeriod.changes.forEach((change) => {
            this.children.push(new ChangeItem(change));
        });
    }
}
