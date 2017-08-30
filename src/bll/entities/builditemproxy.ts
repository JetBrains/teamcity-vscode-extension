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
            //should handle REST case
            if (!this._buildObj ||
                !this._buildObj.build ||
                !this._buildObj.build.$ ||
                this._buildObj.build.$.personal === undefined) {

                Logger.logDebug(`BuildItemProxy#isPersonal: isPersonal is not reachable. default: false`);
                return false;
            }
            return (this._buildObj.build.$.personal === "true");
        }
        return (this._buildObj.personal[0] === "true");
    }

    public get id(): number {
        if (!this._buildObj ||
            this._buildObj.id === undefined ||
            this._buildObj.id[0] === undefined) {
            //should handle REST case
            if (!this._buildObj ||
                !this._buildObj.build ||
                !this._buildObj.build.$ ||
                this._buildObj.build.$.id === undefined) {

                Logger.logDebug(`BuildItemProxy#changeId: changeId is not reachable. default: -1`);
                return -1;
            }
            return this._buildObj.build.$.id;
        }
        return this._buildObj.id[0];
    }

    public get number(): number {
        if (!this._buildObj ||
            this._buildObj.number === undefined ||
            this._buildObj.number[0] === undefined) {
            //should handle REST case
            if (!this._buildObj ||
                !this._buildObj.build ||
                !this._buildObj.build.$ ||
                this._buildObj.build.$.number === undefined) {

                Logger.logDebug(`BuildItemProxy#changeId: changeId is not reachable. default: -1`);
                return -1;
            }
            return this._buildObj.build.$.number;
        }
        return this._buildObj.number[0];
    }

    public get status(): string {
        if (!this._buildObj ||
            !this._buildObj.statusDescriptor ||
            !this._buildObj.statusDescriptor[0] ||
            this._buildObj.statusDescriptor[0].myText === undefined ||
            this._buildObj.statusDescriptor[0].myText[0] === undefined) {
            //should handle REST case
            if (!this._buildObj ||
                !this._buildObj.build ||
                !this._buildObj.build.$ ||
                this._buildObj.build.$.status === undefined) {

                Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: UNKNOWN`);
                return "UNKNOWN";
            }
            return this._buildObj.build.$.status;

        }
        return this._buildObj.statusDescriptor[0].myText[0];
    }

    public get projectName(): string {
        if (!this._buildObj ||
            !this._buildObj.build ||
            !this._buildObj.build.buildType ||
            !this._buildObj.build.buildType[0] ||
            !this._buildObj.build.buildType[0].$) {

            Logger.logDebug(`BuildItemProxy#projectName: projectName is not reachable. default: undefined`);
            return undefined;
        }
        return this._buildObj.build.buildType[0].$.projectName;
    }

    public get name(): string {
        if (!this._buildObj ||
            !this._buildObj.build ||
            !this._buildObj.build.buildType ||
            !this._buildObj.build.buildType[0] ||
            !this._buildObj.build.buildType[0].$) {

            Logger.logDebug(`BuildItemProxy#projectName: build name is not reachable. default: undefined`);
            return undefined;
        }
        return this._buildObj.build.buildType[0].$.name;
    }

    public get webUrl(): string | undefined {
        if (!this._buildObj ||
            !this._buildObj.build ||
            !this._buildObj.build.$) {
            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: undefined`);
            return undefined;
        }
        return this._buildObj.build.$.webUrl;
    }

    public get statusText(): string | undefined {
        if (!this._buildObj ||
            !this._buildObj.build ||
            !this._buildObj.build.statusText) {
            Logger.logDebug(`BuildItemProxy#status: status is not reachable. default: empty string`);
            return "";
        }
        return this._buildObj.build.statusText;
    }
}
