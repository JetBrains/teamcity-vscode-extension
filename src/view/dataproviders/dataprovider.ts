"use strict";

import {TreeItem, TreeDataProvider, commands, Event} from "vscode";
import {DataProviderEnum} from "../providermanager";

export abstract class DataProvider implements TreeDataProvider<TreeItem> {
    abstract onDidChangeTreeData?: Event<TreeItem>;
    abstract getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem>;
    abstract getChildren(element?: TreeItem): TreeItem[] | Thenable<TreeItem[]>;

    public show(): void {
        commands.executeCommand("setContext", "teamcity-explorer", this.getType());
    }

    abstract reset(): void;

    abstract setContent(content: TreeItem[]): void;

    abstract getSelectedContent(): TreeItem[];

    abstract refreshContent(): void;

    abstract getType(): DataProviderEnum;
}