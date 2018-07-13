import {Context} from "./Context";
import {commands} from "vscode";
import {inject, injectable} from "inversify";
import {TYPES} from "../bll/utils/constants";
import {Settings} from "../bll/entities/settings";

@injectable()
export class ContextImpl implements Context {

    constructor(@inject(TYPES.Settings) private readonly mySettings: Settings) {
        this.setQueueAtTop(false);
        this.showPreTestedCommitButton(false);
        this.setSignIn(false);
        this.setShowRemoteRunButton(false);
    }

    showPreTestedCommitButton(show: boolean) {
        const shouldShow: boolean = this.mySettings.isTfvcPreTestedSupported() && show;
        commands.executeCommand("setContext", "teamcity-show-pretested-commit", shouldShow);
    }

    setQueueAtTop(value: boolean) {
        commands.executeCommand("setContext", "teamcity-queue-at-top", value);
    }

    setSignIn(value: boolean) {
        commands.executeCommand("setContext", "teamcity-signed-in", value);
    }

    setShowRemoteRunButton(value: boolean) {
        commands.executeCommand("setContext", "teamcity-show-remote-run-button", value);
    }

    dispose(): any {
        this.setQueueAtTop(false);
        this.showPreTestedCommitButton(false);
        this.setSignIn(false);
        this.setShowRemoteRunButton(false);
    }
}
