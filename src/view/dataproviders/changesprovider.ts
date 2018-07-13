import {DataProvider} from "./dataprovider";
import {EventEmitter, TreeItem, TreeItemCollapsibleState} from "vscode";
import {injectable} from "inversify";
import {DataProviderEnum} from "../../bll/utils/constants";
import {IChangesProvider} from "./interfaces/ichangesprovider";
import {TimePeriodItem} from "../../bll/entities/presentable/timeperioditem";
import {TimePeriod} from "../../bll/entities/timeperiod";

@injectable()
export class ChangesProvider extends DataProvider implements IChangesProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private timePeriods: TimePeriodItem[] = [];

    public resetTreeContent(): void {
        this.timePeriods = [];
    }

    public setContent(timePeriods: TimePeriod[]): void {
        this.resetTreeContent();
        timePeriods.forEach((timePeriod) => {
            const timePeriodItem = new TimePeriodItem(timePeriod);
            this.timePeriods.push(timePeriodItem);
        });
        this.refreshTreePresentation();
    }

    public refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.timePeriods;
        } else if (element instanceof TimePeriodItem) {
            return element.children;
        }
    }

    public getType(): DataProviderEnum {
        return DataProviderEnum.ChangesProvider;
    }
}
