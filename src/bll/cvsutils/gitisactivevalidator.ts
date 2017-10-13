"use strict";

import {workspace} from "vscode";
import {Validator} from "./validator";
import {Logger} from "../utils/logger";
import * as cp_module from "child-process-promise";
import {AsyncChildProcess} from "../moduleinterfaces/asyncchildprocess";

export class GitIsActiveValidator implements Validator {
    private readonly _path: string;
    private readonly _childProcess: AsyncChildProcess;

    constructor(path: string, childProcessMock?: any) {
        this._path = path;
        this._childProcess = childProcessMock || cp_module;
    }

    public async validate(): Promise<void> {
        const path = this._path;
        await this.checkVersionCompatibility(path);
        //await this.checkIsGitRepository(path);
    }

    private async checkVersionCompatibility(path: string) {
        const version: string = await this.getVersion(path);
        this.checkVersion(version);
    }

    private async getVersion(path: string): Promise<string> {
        const promiseResult = await  this._childProcess.exec(`"${path}" --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        return this.parseVersion(versionCommandResult);
    }

    private parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }

    private checkVersion(version: string): void {
        if (this.isFirstVersion(version)) {
            Logger.logWarning(`GitUtils#collectInfo: git ${version} installed. TeamCity extension requires git >= 2`);
            throw new Error(`Git ${version} installed. TeamCity extension requires git >= 2`);
        }
    }

    private isFirstVersion(version: string): boolean {
        return /^[01]/.test(version);
    }

    private async checkIsGitRepository(path: string): Promise<void> {
        const revParseCommand: string = `"${path}" -C "${workspace.rootPath}" rev-parse --show-toplevel`;
        Logger.logDebug(`GitUtils#collectInfo: revParseCommand is ${revParseCommand}`);
        try {
            await  this._childProcess.exec(revParseCommand);
        } catch (err) {
            throw new Error("Git repository was not determined");
        }
    }

    private async checkStagedFilesPresence(path: string): Promise<void> {
        const gitDiffCommand: string = `"${path}" -C "${workspace.rootPath}" diff --name-only --staged`;
        Logger.logDebug(`GitUtils#collectInfo: gitDiffCommand is ${gitDiffCommand}`);
        const gitDiffOutput = await  this._childProcess.exec(gitDiffCommand);
        const diffResults: string = gitDiffOutput.stdout.toString("utf8").trim();
        const stagedFilesNotPresence: boolean = !diffResults;
        if (stagedFilesNotPresence) {
            throw new Error("There are no staged files in git");
        }
    }
}
