"use strict";

import * as path from "path";
import {BuildConfigItem} from "./buildconfigitem";
import {
    CancellationToken,
    Command,
    commands,
    EventEmitter,
    ExtensionContext,
    ProviderResult,
    TextDocumentContentProvider,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    Uri,
    workspace
} from "vscode";

export class ProjectItem extends TreeItem {
    public configs: BuildConfigItem[];

    constructor(label: string, configs: BuildConfigItem[]) {
        super(label, TreeItemCollapsibleState.Collapsed);
        this.configs = configs;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "project.png";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public get command(): Command {
        return {
            command: "changeCollapsibleState",
            arguments: [this],
            title: "Change Collapsible State"
        };
    }

    public changeCollapsibleState(): void {
        if (this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
        } else {
            this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }
    }
}
