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
        return new Summary(visibleProjectIds, changes, personalChanges);
    }

    private static getVisibleProjectIds(summaryObj: any): string[] {
        if (!summaryObj ||
            !summaryObj.myVisibleProjects ||
            !summaryObj.myVisibleProjects[0] ||
            !summaryObj.myVisibleProjects[0].string) {
            Logger.logDebug(`Summary#getVisibleProjectIds: visibleProjectIds are not reachable`);
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
            Logger.logDebug(`Summary#extractChanges: changes are not reachable`);
            return [];
        }
        const changes: any[] = summaryObj.changes[0].ChangeInfo;
        changes.forEach((change) => {
            try {
                const changeWrapped: Change = Change.fromXmlRpcObject(change);
                result.push(changeWrapped);
            } catch (err) {
                Logger.logDebug("Can't wrap change. Initial error: " + err.stack);
            }
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
            Logger.logDebug(`Summary#extractPersonalChanges: personalChanges are not reachable`);
            return [];
        }
        const changes: any[] = summaryObj.personalChanges[0].ChangeInfo;
        changes.forEach((change) => {
            try {
                const changeWrapped: Change = Change.fromXmlRpcObject(change);
                result.push(changeWrapped);
            } catch (err) {
                Logger.logDebug("Can't wrap change. Initial error: " + err.stack);
            }
        });
        return result;
    }

}
