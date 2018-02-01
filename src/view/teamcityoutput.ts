"use strict";

import {Output} from "./output";
import {OutputChannel, window} from "vscode";
import {injectable} from "inversify";

@injectable()
export class TeamCityOutput implements Output {
    private outputChannel: OutputChannel;

    public constructor() {
        this.outputChannel = window.createOutputChannel("TeamCity");
    }

    public appendLine(line: string) {
        if (this.outputChannel) {
            this.outputChannel.append(line + "\n\n");
        }
    }

    public show() {
        if (this.outputChannel) {
            this.outputChannel.show(true);
        }
    }

    public dispose() {
        if (this.outputChannel) {
            this.outputChannel.dispose();
        }
    }
}
