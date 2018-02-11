import {commands, Event, TreeDataProvider, TreeItem} from "vscode";
import {injectable} from "inversify";
import {DataProviderEnum} from "../../bll/utils/constants";

@injectable()
export abstract class DataProvider implements TreeDataProvider<TreeItem> {

    abstract onDidChangeTreeData?: Event<TreeItem>;

    public getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    abstract getChildren(element?: TreeItem): TreeItem[] | Thenable<TreeItem[]>;

    public show(): void {
        commands.executeCommand("setContext", "teamcity-explorer", this.getType());
    }

    abstract resetTreeContent(): void;

    abstract refreshTreePresentation(): void;

    abstract getType(): DataProviderEnum;
}
