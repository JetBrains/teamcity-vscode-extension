"use strict";

import {inject, injectable} from "inversify";
import {TYPES} from "./bll/utils/constants";
import {Output} from "./view/output";
import {GetSuitableConfigs} from "./bll/commands/getsuitableconfigs";
import {SelectFilesForRemoteRun} from "./bll/commands/selectfilesforremoterun";
import {RemoteRun} from "./bll/commands/remoterun";
import {SignIn} from "./bll/commands/signin";

@injectable()
export class CommandHolder {

    private output: Output;
    private _signIn: SignIn;
    private _selectFilesForRemoteRun: SelectFilesForRemoteRun;
    private _getSuitableConfigs: GetSuitableConfigs;
    private _remoteRun: RemoteRun;

    constructor(@inject(TYPES.Output) output: Output,
                @inject(TYPES.SignIn) signInCommand: SignIn,
                @inject(TYPES.SelectFilesForRemoteRun) selectFilesForRemoteRun: SelectFilesForRemoteRun,
                @inject(TYPES.GetSuitableConfigs) getSuitableConfigs: GetSuitableConfigs,
                @inject(TYPES.RemoteRun) remoteRun: RemoteRun) {
        this.output = output;
        this._signIn = signInCommand;
        this._selectFilesForRemoteRun = selectFilesForRemoteRun;
        this._getSuitableConfigs = getSuitableConfigs;
        this._remoteRun = remoteRun;
    }

    public get signIn(): SignIn {
        return this._signIn;
    }

    public get selectFilesForRemoteRun(): Command {
        return this._selectFilesForRemoteRun;
    }

    public get getSuitableConfigs(): Command {
        return this._getSuitableConfigs;
    }

    public get remoteRunWithChosenConfigs(): Command {
        return this._remoteRun;
    }

    public showOutput(): void {
        this.output.show();
    }
}
