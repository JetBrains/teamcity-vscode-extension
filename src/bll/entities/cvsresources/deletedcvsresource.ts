"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {CvsFileStatusCode} from "../../utils/constants";
import {LeaveSelectableItem} from "../leaveselectableitem";
import {CvsResource} from "./cvsresource";

export class DeletedCvsResource extends CvsResource {
    private readonly DELETE_PREFIX: number = 3;

    constructor(prevFileAbsPath: string, label: string) {
        super(CvsFileStatusCode.DELETED, prevFileAbsPath, label);
    }

    protected getPrefix(): number {
        return this.DELETE_PREFIX;
    }
}
