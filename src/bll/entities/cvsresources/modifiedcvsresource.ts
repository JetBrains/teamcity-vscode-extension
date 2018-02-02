"use strict";

import {CvsFileStatusCode} from "../../utils/constants";
import {CvsResource} from "./cvsresource";

export class ModifiedCvsResource extends CvsResource {
    private readonly MODIFIED_PREFIX: number = 25;

    constructor(fileAbsPath: string, label: string) {
        super(CvsFileStatusCode.MODIFIED, fileAbsPath, label);
    }

    protected getPrefix(): number {
        return this.MODIFIED_PREFIX;
    }
}
