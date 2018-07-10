import {Context} from "./Context";
import {commands} from "vscode";
import {injectable} from "inversify";

@injectable()
export class ContextImpl implements Context {
    constructor() {
        this.setQueueAtTop(false);
        this.showPreTestedCommitButton(false);
        this.setSignIn(false);
        this.setShowRemoteRunButton(false);
    }

    showPreTestedCommitButton(show: boolean) {
        commands.executeCommand("setContext", "teamcity-show-pretested-commit", show);
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
