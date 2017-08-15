"use strict";

import * as path from "path";
import { CvsFileStatusCode } from "../utils/constants";
import { TreeItem, Uri, Command, TreeItemCollapsibleState } from "vscode";

export abstract class LeaveSelectableItem extends TreeItem {
    private _isIncl : boolean;
    constructor(label: string, isIncl: boolean = false) {
        super(label, TreeItemCollapsibleState.None);
        this._isIncl = isIncl;
    }
    public get command() : Command {
        return {
            command: "changeConfigState",
            arguments: [this],
            title: "Change build config group"
        };
    }

    public get isIncl() : boolean {
        return this._isIncl;
    }

    public changeState() : void {
        this._isIncl = !this._isIncl;
    }
}

export class BuildConfigItem extends LeaveSelectableItem {
    private readonly _id : string;
    private readonly _externalId : string;
    constructor(id: string, externalId : string, label: string) {
        super(label, false);
        this._id = id;
        this._externalId = externalId;
    }

    public get iconPath() : string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName : string = "config - " + (this.isIncl ? "incl" : "excl") + ".png";
        return {
            light: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName)
        };
    }

    public get id() : string {
        return this._id;
    }

    public get externalId() : string {
        return this._externalId;
    }
}

export class CvsLocalResource extends LeaveSelectableItem {
    status : CvsFileStatusCode;
    fileAbsPath : string;
    prevFileAbsPath? : string;

    constructor(status : CvsFileStatusCode, fileAbsPath : string, label: string, prevFileAbsPath? : string) {
        super(label, true);
        this.status = status;
        this.fileAbsPath = fileAbsPath;
        this.prevFileAbsPath = prevFileAbsPath;
    }

    public get iconPath() : string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName : string = `status-${this.isIncl ? this.status : "I"}.svg`;
        return {
            light: path.join(__dirname, "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }
}
