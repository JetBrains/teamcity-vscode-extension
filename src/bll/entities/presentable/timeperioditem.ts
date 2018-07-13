import {TreeItem, TreeItemCollapsibleState, Uri} from "vscode";
import {ExpandableItem} from "./expandableitem";
import {TimePeriod} from "../timeperiod";
import {ChangeItem} from "./changeitem";
import {ImageConstants} from "../imageconstants";
import {TimePeriodEnum} from "../../utils/constants";

export class TimePeriodItem extends ExpandableItem {
    public readonly children: TreeItem[] = [];
    private readonly timePeriod: TimePeriodEnum;

    constructor(timePeriod: TimePeriod) {
        super(timePeriod.timePeriod, TreeItemCollapsibleState.Collapsed);
        if (timePeriod.changes.length === 0) {
            this.collapsibleState = TreeItemCollapsibleState.None;
        }
        this.timePeriod = timePeriod.timePeriod;
        timePeriod.changes.forEach((change) => {
            this.children.push(new ChangeItem(change));
        });
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        return {
            light: ImageConstants.makeTimePeriodImage(this.timePeriod, false),
            dark: ImageConstants.makeTimePeriodImage(this.timePeriod, true)
        };
    }

    public hasChildren() {
        return this.children && this.children.length !== 0;
    }
}
