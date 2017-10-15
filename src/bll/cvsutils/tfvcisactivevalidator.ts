"use strict";

import {workspace} from "vscode";
import {Validator} from "./validator";
import * as cp_module from "child-process-promise";
import {AsyncChildProcess} from "../moduleinterfaces/asyncchildprocess";

export class TfvcIsActiveValidator implements Validator {

    private readonly _path: string;
    private readonly _childProcess: AsyncChildProcess;

    constructor(path: string, childProcessMock?: any) {
        this._path = path;
        this._childProcess = childProcessMock || cp_module;
    }

    public async validate(): Promise<void> {
        const path = this._path;
        await this.checkIsTfsRepository(path);
    }

    private async checkIsTfsRepository(path: string): Promise<void> {
        const briefDiffCommand: string = `"${path}" diff /noprompt /format:brief /recursive "${workspace.rootPath}"`;
        try {
            await this._childProcess.exec(briefDiffCommand);
        } catch (err) {
            throw new Error("Tfs repository was not determined");
        }
    }

    private async checkChangedFilesPresence(path: string): Promise<void> {
        const briefDiffCommand: string = `"${path}" diff /noprompt /format:brief /recursive "${workspace.rootPath}"`;
        const outBriefDiff = await this._childProcess.exec(briefDiffCommand);
        const briefDiffResults: string = outBriefDiff.stdout.toString("utf8").trim();
        const changedFilesNotPresence: boolean = !briefDiffResults;
        if (changedFilesNotPresence) {
            throw new Error("There are no changed files in tfvs");
        }
    }

}
