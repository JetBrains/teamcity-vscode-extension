"use strict";

import {Validator} from "./validator";
import {Logger} from "../utils/logger";
import {CpProxy} from "../moduleproxies/cp-proxy";
import {GitParser} from "./git-parser";

export class GitIsActiveValidator implements Validator {
    private readonly path: string;
    private readonly workspaceRootPath: string;
    private readonly cpProxy: CpProxy;

    constructor(gitPath: string, workspaceRootPath: string, cpProxy?: CpProxy) {
        this.path = gitPath;
        this.workspaceRootPath = workspaceRootPath;
        this.cpProxy = cpProxy || new CpProxy();
    }

    public async validate(): Promise<void> {
        await this.checkVersionCompatibility();
        await this.checkIsGitRepository();
    }

    private async checkVersionCompatibility() {
        const version: string = await this.getVersion(this.path);
        GitIsActiveValidator.checkVersion(version);
    }

    private async getVersion(path: string): Promise<string> {
        const promiseResult = await this.cpProxy.execAsync(`"${path}" --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        return GitParser.parseVersion(versionCommandResult);
    }

    private static checkVersion(version: string): void {
        if (GitIsActiveValidator.isFirstVersion(version)) {
            Logger.logWarning(`GitUtils#collectInfo: git ${version} installed. TeamCity extension requires git >= 2`);
            throw new Error(`Git ${version} installed. TeamCity extension requires git >= 2`);
        }
    }

    private static isFirstVersion(version: string): boolean {
        return /^[01]/.test(version);
    }

    private async checkIsGitRepository(): Promise<void> {
        const revParseCommand: string = `"${this.path}" -C "${this.workspaceRootPath}" rev-parse --show-toplevel`;
        Logger.logDebug(`GitUtils#collectInfo: revParseCommand is ${revParseCommand}`);
        try {
            await this.cpProxy.execAsync(revParseCommand);
        } catch (err) {
            throw new Error("Git repository was not determined");
        }
    }
}
