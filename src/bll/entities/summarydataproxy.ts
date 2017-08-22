"use strict";

import {Logger} from "../utils/logger";
import {ChangeItemProxy} from "./changeitemproxy";

/**
 * Summary Obj contains some number of changes. Some changes Obj contains some number of builds.
 */
export class SummaryDataProxy {
    private readonly _summaryObj: any;

    constructor(summaryObj: any) {
        this._summaryObj = summaryObj;
    }

    public get getVisibleProjectIds(): string[] {
        if (!this._summaryObj ||
            !this._summaryObj.myVisibleProjects ||
            !this._summaryObj.myVisibleProjects[0] ||
            !this._summaryObj.myVisibleProjects[0].string) {
            Logger.logDebug(`SummaryDataProxy#getVisibleProjectIds: visibleProjectIds are not reachable`);
            return [];
        }
        return this._summaryObj.myVisibleProjects[0].string;
    }

    public get personalChanges(): ChangeItemProxy[] {
        const result: ChangeItemProxy[] = [];
        if (!this._summaryObj
            || !this._summaryObj.personalChanges
            || !this._summaryObj.personalChanges[0]
            || !this._summaryObj.personalChanges[0].ChangeInfo
            || this._summaryObj.personalChanges[0].ChangeInfo.length <= 0) {
            Logger.logDebug(`SummaryDataProxy#personalChanges: personalChanges are not reachable`);
            return [];
        }
        this._summaryObj.personalChanges[0].ChangeInfo.forEach((change) => {
            result.push(new ChangeItemProxy(change));
        });
        return result;
    }

    public get changes(): ChangeItemProxy[] {
        const result: ChangeItemProxy[] = [];
        if (!this._summaryObj
            || !this._summaryObj.changes
            || !this._summaryObj.changes[0]
            || !this._summaryObj.changes[0].ChangeInfo
            || this._summaryObj.changes[0].ChangeInfo.length <= 0) {
            Logger.logDebug(`SummaryDataProxy#personalChanges: changes are not reachable`);
            return [];
        }
        const changes: any[] = this._summaryObj.changes[0].ChangeInfo;
        changes.forEach((change) => {
            result.push(new ChangeItemProxy(change));
        });
        return result;
    }
}
