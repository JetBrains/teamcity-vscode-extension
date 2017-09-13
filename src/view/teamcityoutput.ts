"use strict";

import {OutputChannel, window, Disposable} from "vscode";

export class TeamCityOutput {
    private static _instance: TeamCityOutput;
    private _outputChannel: OutputChannel;

    private constructor(disposables: Disposable[]) {
        this._outputChannel = window.createOutputChannel("TeamCity");
        if (disposables) {
            disposables.push(this._outputChannel);
        }
    }

    public static initAndGetInstance(disposables?: Disposable[]): TeamCityOutput {
        this._instance = new TeamCityOutput(disposables);
        return this._instance;
    }

    public appendLine(line: string) {
        if (this._outputChannel) {
            this._outputChannel.append(line + "\n\n");
        }
    }

    public show() {
        if (this._outputChannel) {
            this._outputChannel.show(true);
        }
    }
}
