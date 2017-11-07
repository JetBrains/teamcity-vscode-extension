"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {CvsFileStatusCode} from "../../utils/constants";
import {LeaveSelectableItem} from "../leaveselectableitem";
import {CvsResource} from "./cvsresource";

export class AddedCvsResource extends CvsResource {
    private readonly CREATE_PREFIX: number = 26;

    constructor(fileAbsPath: string, label: string) {
        super(CvsFileStatusCode.ADDED, fileAbsPath, label);
    }

    protected getPrefix(): number {
        return this.CREATE_PREFIX;
    }
}
