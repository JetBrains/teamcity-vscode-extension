import {DataProvider} from "./dataprovider";
import {Event, ProviderResult, TreeItem} from "vscode";
import {DataProviderEnum} from "../../bll/utils/constants";

export class EmptyDataProvider extends DataProvider {

    resetTreeContent(): void {
        throw new Error("Unsupported operation");
    }

    refreshTreePresentation(): void {
        throw new Error("Unsupported operation");
    }

    onDidChangeTreeData?: Event<TreeItem | undefined | null>;

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return undefined;
    }

    getChildren(): ProviderResult<TreeItem[]> {
        return undefined;
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.EmptyDataProvider;
    }
}
