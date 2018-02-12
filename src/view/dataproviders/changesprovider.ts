import {DataProvider} from "./dataprovider";
import {EventEmitter, TreeItem} from "vscode";
import {injectable} from "inversify";
import {DataProviderEnum} from "../../bll/utils/constants";
import {Change} from "../../bll/entities/change";
import {Utils} from "../../bll/utils/utils";
import {ChangeItem} from "../../bll/entities/presentable/changeitem";
import {IChangesProvider} from "./interfaces/ichangesprovider";

@injectable()
export class ChangesProvider extends DataProvider implements IChangesProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private changeItems: ChangeItem[] = [];

    public resetTreeContent(): void {
        this.changeItems = [];
    }

    public setContent(changes: Change[]): void {
        Utils.clearArray(this.changeItems);
        changes.forEach((change) => this.changeItems.push(new ChangeItem(change)));
    }

    public refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.changeItems;
        }
    }

    public getType(): DataProviderEnum {
        return DataProviderEnum.ChangesProvider;
    }
}
