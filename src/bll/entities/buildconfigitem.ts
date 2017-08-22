"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {LeaveSelectableItem} from "./leaveselectableitem";

export class BuildConfigItem extends LeaveSelectableItem {
    private readonly _id: string;
    private readonly _externalId: string;

    constructor(id: string, externalId: string, label: string) {
        super(label, false);
        this._id = id;
        this._externalId = externalId;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = "config - " + (this.isIncluded ? "incl" : "excl") + ".png";
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName)
        };
    }

    public get id(): string {
        return this._id;
    }

    public get externalId(): string {
        return this._externalId;
    }
}
