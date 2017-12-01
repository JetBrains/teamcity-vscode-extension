"use strict";

import {TreeItem, TreeDataProvider, commands, Event, Disposable} from "vscode";
import {DataProviderEnum} from "../providermanager";
import {injectable} from "inversify";

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

    abstract setContent(content: TreeItem[]): void;

    abstract getSelectedContent(): TreeItem[];

    abstract refreshTreePresentation(): void;

    abstract getType(): DataProviderEnum;
}
