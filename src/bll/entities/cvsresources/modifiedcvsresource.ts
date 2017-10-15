"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {CvsFileStatusCode} from "../../utils/constants";
import {LeaveSelectableItem} from "../leaveselectableitem";
import {CvsLocalResource} from "./cvslocalresource";

export class ModifiedCvsResource extends CvsLocalResource {
    private readonly MODIFIED_PREFIX: number = 25;

    constructor(fileAbsPath: string, label: string) {
        super(CvsFileStatusCode.MODIFIED, fileAbsPath, label);
    }

    protected getPrefix(): number {
        return this.MODIFIED_PREFIX;
    }
}
