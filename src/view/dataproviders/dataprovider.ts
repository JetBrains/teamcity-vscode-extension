import {commands, Event, TreeDataProvider, TreeItem} from "vscode";
import {DataProviderEnum} from "../providermanager";
import {injectable} from "inversify";
import {CheckInInfo} from "../../bll/entities/checkininfo";
import {Project} from "../../bll/entities/project";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";

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

    abstract setContent(content: CheckInInfo[] | Project[]): void;

    abstract getSelectedContent(): TreeItem[] | CvsResource[] | CheckInInfo[];

    abstract refreshTreePresentation(): void;

    abstract getType(): DataProviderEnum;
}
