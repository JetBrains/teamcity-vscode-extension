"use strict";

import {Logger} from "../utils/logger";

export class BuildItemProxy {
    private readonly _buildObj: any;

    constructor(buildObj: any) {
        this._buildObj = buildObj;
    }

    public get isPersonal(): boolean {
        if (!this._buildObj ||
            this._buildObj.personal === undefined ||
            this._buildObj.personal[0] === undefined) {
            Logger.logDebug(`BuildItemProxy#isPersonal: isPersonal is not reachable. default: false`);
            return false;
        }
        return (this._buildObj.personal[0] === "true");
    }

    public get buildId(): number {
        if (!this._buildObj ||
            this._buildObj.id === undefined ||
            this._buildObj.id[0] === undefined) {
            Logger.logDebug(`BuildItemProxy#changeId: changeId is not reachable. default: -1`);
            return -1;
        }
        return this._buildObj.id[0];
    }

    public get status(): string {
        if (!this._buildObj ||
            !this._buildObj.statusDescriptor ||
            !this._buildObj.statusDescriptor[0] ||
            this._buildObj.statusDescriptor[0].myText === undefined ||
            this._buildObj.statusDescriptor[0].myText[0] === undefined) {
            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: UNKNOWN`);
            return "UNKNOWN";
        }
        return this._buildObj.statusDescriptor[0].myText[0];
    }
}
