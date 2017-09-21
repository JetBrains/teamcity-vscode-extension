"use strict";

import {Logger} from "../utils/logger";
import {Change} from "./change";

export class Summary {
    public readonly changes: Change[];
    public readonly personalChanges: Change[];
    public readonly visibleProjectIds: string[];

    public constructor(visibleProjectIds: string[], changes: Change[], personalChanges: Change[]) {
        this.changes = changes;
        this.personalChanges = personalChanges;
        this.visibleProjectIds = visibleProjectIds;
    }

    public static fromXmlRpcObject(summaryObj: any): Summary {
        if (!summaryObj.Summary) {
            throw "Not Summary Object Error";
        }
        summaryObj = summaryObj.Summary;
        const visibleProjectIds: string[] = Summary.getVisibleProjectIds(summaryObj);
        const changes: Change[] = Summary.extractChanges(summaryObj);
        const personalChanges: Change[] = Summary.extractPersonalChanges(summaryObj);
        const instance: Summary = new Summary(visibleProjectIds, changes, personalChanges);
        return instance;
    }

    private static getVisibleProjectIds(summaryObj: any): string[] {
        if (!summaryObj ||
            !summaryObj.myVisibleProjects ||
            !summaryObj.myVisibleProjects[0] ||
            !summaryObj.myVisibleProjects[0].string) {
            Logger.logDebug(`SummaryDataProxy#getVisibleProjectIds: visibleProjectIds are not reachable`);
            return [];
        }
        return summaryObj.myVisibleProjects[0].string;
    }

    private static extractChanges(summaryObj: any): Change[] {
        const result: Change[] = [];
        if (!summaryObj
            || !summaryObj.changes
            || !summaryObj.changes[0]
            || !summaryObj.changes[0].ChangeInfo
            || summaryObj.changes[0].ChangeInfo.length <= 0) {
            Logger.logDebug(`SummaryDataProxy#personalChanges: changes are not reachable`);
            return [];
        }
        const changes: any[] = summaryObj.changes[0].ChangeInfo;
        changes.forEach((change) => {
            result.push(Change.fromXmlRpcObject(change));
        });
        return result;
    }

    private static extractPersonalChanges(summaryObj: any): Change[] {
        const result: Change[] = [];
        if (!summaryObj
            || !summaryObj.personalChanges
            || !summaryObj.personalChanges[0]
            || !summaryObj.personalChanges[0].ChangeInfo
            || summaryObj.personalChanges[0].ChangeInfo.length <= 0) {
            Logger.logDebug(`SummaryDataProxy#personalChanges: personalChanges are not reachable`);
            return [];
        }
        const changes: any[] = summaryObj.personalChanges[0].ChangeInfo;
        changes.forEach((change) => {
            result.push(Change.fromXmlRpcObject(change));
        });
        return result;
    }

}
