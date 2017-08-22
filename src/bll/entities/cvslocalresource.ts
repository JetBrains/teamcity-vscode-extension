"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {CvsFileStatusCode} from "../utils/constants";
import {LeaveSelectableItem} from "./leaveselectableitem";

export class CvsLocalResource extends LeaveSelectableItem {
    status: CvsFileStatusCode;
    fileAbsPath: string;
    prevFileAbsPath?: string;

    constructor(status: CvsFileStatusCode, fileAbsPath: string, label: string, prevFileAbsPath?: string) {
        super(label, true);
        this.status = status;
        this.fileAbsPath = fileAbsPath;
        this.prevFileAbsPath = prevFileAbsPath;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = `status-${this.isIncluded ? this.status : "I"}.svg`;
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }
}
