"use strict";

import * as os_module from "os";
import {Finder} from "./finder";
import {workspace} from "vscode";
import {Os} from "../moduleinterfaces/os";
import {Constants} from "../utils/constants";
import * as cp_module from "child-process-promise";
import {AsyncChildProcess} from "../moduleinterfaces/asyncchildprocess";

export class TfvcPathFinder implements Finder {

    private readonly _os: Os;
    private readonly _childProcess: AsyncChildProcess;

    constructor(childProcessMock?: AsyncChildProcess, osMock?: Os) {
        this._os = osMock || os_module;
        this._childProcess = childProcessMock || cp_module;
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
