"use strict";

import {Finder} from "./finder";
import * as os_module from "os";
import {workspace} from "vscode";
import {Constants} from "../utils/constants";
import * as cp_module from "child-process-promise";

export class TfvcPathFinder implements Finder {

    private readonly _childProcess;
    private readonly _os;

    constructor(childProcessMock?: any, osMock?: any) {
        this._childProcess = childProcessMock || cp_module;
        this._os = osMock || os_module;
    }

    public async find(): Promise<string> {
        const pathHint = this.getPathHind();
        try {
            return await this.findTfsPath(pathHint);
        } catch (err) {
            throw new Error("tfvc command line util not found");
        }
    }

    private async findTfsPath(pathHint: string): Promise<string> {
        pathHint = this.replaceLeadingTildeForUnixLikePlatforms(pathHint);
        if (pathHint) {
            pathHint = pathHint.trim();
        }
        const firstSearchPromise = pathHint ? this.checkPath(pathHint) : Promise.reject<string>(undefined);
        return firstSearchPromise.then(void 0, () => this.checkPath("tf"));
    }

    private getPathHind(): string {
        const configuration = workspace.getConfiguration();
        return configuration.get<string>(Constants.TFS_LOCATION_SETTING_NAME, undefined);
    }

    private replaceLeadingTildeForUnixLikePlatforms(location: string): string {
        if (location && location.startsWith("~/") && this.isUnixLikePlatform()) {
            return location.replace(/^~(\/)/, `${this._os.homedir()}$1`);
        } else {
            return location;
        }
    }

    private isUnixLikePlatform(): boolean {
        return this._os.platform() === "darwin" || this._os.platform() === "linux";
    }

    private async checkPath(path: string): Promise<string> {
        const promiseResult = await this._childProcess.exec(`"${path}"`);
        const tfCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!tfCommandResult) {
            return Promise.reject<string>(undefined);
        }
        return path;
    }
}
