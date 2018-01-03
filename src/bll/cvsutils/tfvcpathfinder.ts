"use strict";

import {Finder} from "./finder";
import {workspace} from "vscode";
import {Constants} from "../utils/constants";
import {OsProxy} from "../moduleproxies/os-proxy";
import {CpProxy} from "../moduleproxies/cp-proxy";

export class TfvcPathFinder implements Finder {

    private readonly cp: CpProxy;
    private readonly os: OsProxy;

    constructor(cp: CpProxy, os: OsProxy) {
        this.os = os;
        this.cp = cp;
    }

    public async find(): Promise<string> {
        const pathHint = this.getPathHint();
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

    private getPathHint(): string {
        const configuration = workspace.getConfiguration();
        return configuration.get<string>(Constants.TFS_LOCATION_SETTING_NAME, undefined);
    }

    private replaceLeadingTildeForUnixLikePlatforms(location: string): string {
        if (location && location.startsWith("~/") && this.isUnixLikePlatform()) {
            return location.replace(/^~(\/)/, `${this.os.homedir()}$1`);
        } else {
            return location;
        }
    }

    private isUnixLikePlatform(): boolean {
        return this.os.platform() === "darwin" || this.os.platform() === "linux";
    }

    private async checkPath(path: string): Promise<string> {
        const promiseResult = await this.cp.execAsync(`"${path}"`);
        const tfCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!tfCommandResult) {
            return Promise.reject<string>(undefined);
        }
        return path;
    }
}
