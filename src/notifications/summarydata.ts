"use strict";

export class SummaryDataProxy {
    private readonly _summaryObj;
    constructor (summaryObj : any) {
        this._summaryObj = summaryObj;
    }

    public get getVisibleProjectIds() : string[] {
        return this._summaryObj.myVisibleProjects[0].string || [];
    }
}
