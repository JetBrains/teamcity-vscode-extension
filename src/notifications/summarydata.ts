"use strict";

/**
 * Summary Obj contains some number of changes. Some changes Obj contains some number of builds.
 */
export class SummaryDataProxy {
    private readonly _summaryObj : any;
    constructor (summaryObj : any) {
        this._summaryObj = summaryObj;
    }

    public get getVisibleProjectIds() : string[] {
        if (!this._summaryObj ||
            !this._summaryObj.myVisibleProjects ||
            !this._summaryObj.myVisibleProjects[0] ||
            !this._summaryObj.myVisibleProjects[0].string) {
                return [];
            }
        return this._summaryObj.myVisibleProjects[0].string;
    }

    public get personalChanges() : ChangeItemProxy[] {
        const result : ChangeItemProxy[] = [];
        if (   !this._summaryObj
            || !this._summaryObj.personalChanges
            || !this._summaryObj.personalChanges[0]
            || !this._summaryObj.personalChanges[0].ChangeInfo
            || this._summaryObj.personalChanges[0].ChangeInfo.length <= 0 ) {
            return [];
        }
        this._summaryObj.personalChanges[0].ChangeInfo.forEach((change) => {
            result.push(new ChangeItemProxy(change));
        });
        return result;
    }

    public get changes() : ChangeItemProxy[] {
        const result : ChangeItemProxy[] = [];
        if (   !this._summaryObj
            || !this._summaryObj.changes
            || !this._summaryObj.changes[0]
            || !this._summaryObj.changes[0].ChangeInfo
            || this._summaryObj.changes[0].ChangeInfo.length <= 0 ) {
            return [];
        }
        const changes : any[] = this._summaryObj.changes[0].ChangeInfo;
        changes.forEach((change) => {
            result.push(new ChangeItemProxy(change));
        });
        return result;
    }
}

export class ChangeItemProxy {
    private readonly _changeObj : any;
    constructor (changeObj : any) {
        this._changeObj = changeObj;
    }

    public get isPersonal() : boolean {
        if (!this._changeObj ||
            !this._changeObj.mod ||
            !this._changeObj.mod[0] ||
            this._changeObj.mod[0].personal === undefined ||
            this._changeObj.mod[0].personal[0] === undefined) {
                return false;
            }
        return (this._changeObj.mod[0].personal[0] === "true");
    }

    public get changeId() : number {
        if (!this._changeObj ||
            !this._changeObj.mod ||
            !this._changeObj.mod[0] ||
            this._changeObj.mod[0].id === undefined ||
            this._changeObj.mod[0].id[0] === undefined) {
                return -1;
            }
        return this._changeObj.mod[0].id[0];
    }

    public get status() : string {
        if (!this._changeObj ||
            !this._changeObj.myStatus ||
            !this._changeObj.myStatus[0]) {
                return "UNKNOWN";
            }
        return this._changeObj.myStatus[0];
    }

    public get builds() : BuildItemProxy[] {
        if (!this._changeObj ||
            !this._changeObj.myTypeToInstanceMap ||
            !this._changeObj.myTypeToInstanceMap[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build[0].id ) {
                return [];
            }
        const builds : BuildItemProxy[] = [];
        this._changeObj.myTypeToInstanceMap[0].entry.forEach((entry) => {
            if (entry && entry.Build && entry.Build[0]) {
                builds.push(new BuildItemProxy(entry.Build[0]));
            }
        });
        return builds;
    }
}

export class BuildItemProxy {
    private readonly _buildObj : any;
    constructor (buildObj : any) {
        this._buildObj = buildObj;
    }

    public get isPersonal() : boolean {
        if (!this._buildObj ||
            this._buildObj.personal === undefined ||
            this._buildObj.personal[0] === undefined) {
            return false;
        }
        return (this._buildObj.personal[0] === "true");
    }

    public get buildId() : number {
        if (!this._buildObj ||
            this._buildObj.id === undefined ||
            this._buildObj.id[0] === undefined) {
            return -1;
        }
        return this._buildObj.id[0];
    }

    public get status() : string {
        if (!this._buildObj ||
            !this._buildObj.statusDescriptor ||
            !this._buildObj.statusDescriptor[0] ||
            this._buildObj.statusDescriptor[0].myText === undefined ||
            this._buildObj.statusDescriptor[0].myText[0] === undefined) {
            return "UNKNOWN";
        }
        return this._buildObj.statusDescriptor[0].myText[0];
    }
}
