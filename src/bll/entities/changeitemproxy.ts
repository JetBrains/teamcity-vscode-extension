"use strict";

import {Logger} from "../utils/logger";
import {BuildItemProxy} from "./builditemproxy";

export class ChangeItemProxy {
    private readonly _changeObj: any;
    public builds: BuildItemProxy[];

    constructor(changeObj: any) {
        this._changeObj = changeObj;

        if (!this._changeObj ||
            !this._changeObj.myTypeToInstanceMap ||
            !this._changeObj.myTypeToInstanceMap[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build[0] ||
            !this._changeObj.myTypeToInstanceMap[0].entry[0].Build[0].id) {
            Logger.logDebug(`ChangeItemProxy#constructor: builds is not reachable`);
            this.builds = [];
        }
        const builds: BuildItemProxy[] = [];
        this._changeObj.myTypeToInstanceMap[0].entry.forEach((entry) => {
            if (entry && entry.Build && entry.Build[0]) {
                builds.push(new BuildItemProxy(entry.Build[0]));
            }
        });
        this.builds = builds;
    }

    public get isPersonal(): boolean {
        if (!this._changeObj ||
            !this._changeObj.mod ||
            !this._changeObj.mod[0] ||
            this._changeObj.mod[0].personal === undefined ||
            this._changeObj.mod[0].personal[0] === undefined) {
            Logger.logDebug(`ChangeItemProxy#isPersonal: isPersonal is not reachable. default: false`);
            return false;
        }
        return (this._changeObj.mod[0].personal[0] === "true");
    }

    public get changeId(): number {
        if (!this._changeObj ||
            !this._changeObj.mod ||
            !this._changeObj.mod[0] ||
            this._changeObj.mod[0].id === undefined ||
            this._changeObj.mod[0].id[0] === undefined) {
            Logger.logDebug(`ChangeItemProxy#changeId: changeId is not reachable. default: -1`);
            return -1;
        }
        return this._changeObj.mod[0].id[0];
    }

    public get status(): string {
        if (!this._changeObj ||
            !this._changeObj.myStatus ||
            !this._changeObj.myStatus[0]) {
            Logger.logDebug(`ChangeItemProxy#status: status is not reachable. default: UNKNOWN`);
            return "UNKNOWN";
        }
        return this._changeObj.myStatus[0];
    }
}
