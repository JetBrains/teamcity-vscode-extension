import {Context} from "./Context";
import {commands} from "vscode";

export class ContextImpl implements Context {
    showPreTestedCommitButton(show: boolean) {
        commands.executeCommand("setContext", "teamcity-show-pretested-commit", show);
    }
}
