"use strict";

import {DataProvider} from "./dataprovider";
import {TreeItem, TreeDataProvider, ProviderResult, Event, commands} from "vscode";
import {DataProviderEnum} from "../providermanager";

export class BuildProvider extends DataProvider {

    reset(): void {
        throw new Error("Unsupported operation");
    }

    setContent(content: TreeItem[]): void {
        throw new Error("Unsupported operation");
    }

    getSelectedContent(): TreeItem[] {
        throw new Error("Unsupported operation");
    }

    refreshContent(): void {
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
        return DataProviderEnum.BuildsProvider;
    }
}

