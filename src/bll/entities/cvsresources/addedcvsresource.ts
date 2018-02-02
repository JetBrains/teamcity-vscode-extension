"use strict";

import {CvsFileStatusCode} from "../../utils/constants";
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
