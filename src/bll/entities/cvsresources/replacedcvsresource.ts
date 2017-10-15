"use strict";

import * as path from "path";
import {Uri} from "vscode";
import {CvsFileStatusCode} from "../../utils/constants";
import {LeaveSelectableItem} from "../leaveselectableitem";
import {CvsLocalResource} from "./cvslocalresource";

export class ReplacedCvsResource extends CvsLocalResource {
    private readonly MODIFIED_PREFIX: number = 25;

    constructor(fileAbsPath: string, label: string, prevFileAbsPath: string) {
        super(CvsFileStatusCode.RENAMED, fileAbsPath, label, prevFileAbsPath);
    }

    protected getPrefix(): number {
        return this.MODIFIED_PREFIX;
    }
}
