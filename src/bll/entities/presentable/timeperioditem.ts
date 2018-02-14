import {TreeItem, TreeItemCollapsibleState} from "vscode";
import {ExpandableItem} from "./expandableitem";
import {TimePeriod} from "../timeperiod";
import {ChangeItem} from "./changeitem";

export class TimePeriodItem extends ExpandableItem {
    public children: TreeItem[] = [];

    constructor(timePeriod: TimePeriod) {
        super(timePeriod.name, TreeItemCollapsibleState.Collapsed);
        timePeriod.changes.forEach((change) => {
            this.children.push(new ChangeItem(change));
        });
    }

    // public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
    //     const iconName: string = "project.svg";
    //     return {
    //         light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
    //         dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
    //     };
    // }
}
