"use strict";

import * as path from "path";
import {CvsLocalResource} from "./cvsresources/cvslocalresource";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {TreeItemCollapsibleState, TreeItem, Uri, Command} from "vscode";

export class CheckInInfo extends TreeItem {

    constructor(cvsLocalResources: CvsLocalResource[], cvsProvider: CvsSupportProvider, serverItems: string[] = [],  workItemIds: number[] = []) {
        super(cvsProvider.getRootPath(), TreeItemCollapsibleState.Collapsed);
        this.cvsLocalResources = cvsLocalResources;
        this.serverItems = serverItems;
        this.workItemIds = workItemIds;
        this.cvsProvider = cvsProvider;
    }

    message: string;
    cvsLocalResources: CvsLocalResource[];
    serverItems: string[];
    workItemIds: number[];
    cvsProvider: CvsSupportProvider;

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
            const iconName: string = "project.svg";
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
