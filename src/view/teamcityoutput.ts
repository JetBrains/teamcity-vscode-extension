"use strict";

import {OutputChannel, window, Disposable} from "vscode";

export class TeamCityOutput {
    private static _outputChannel: OutputChannel;

    public static init(disposables: Disposable[]): void {
        if (TeamCityOutput._outputChannel !== undefined) {
            return;
        }
        TeamCityOutput._outputChannel = window.createOutputChannel("TeamCity");
        if (disposables) {
            disposables.push(TeamCityOutput._outputChannel);
        }
    }

    public static appendLine(line: string) {
        if (TeamCityOutput._outputChannel) {
            TeamCityOutput._outputChannel.append(line + "\n\n");
        }
    }

    public static show() {
        if (TeamCityOutput._outputChannel) {
            TeamCityOutput._outputChannel.show();
        }
    }
}
