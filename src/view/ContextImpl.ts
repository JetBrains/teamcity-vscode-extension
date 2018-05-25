import {Context} from "./Context";
import {commands} from "vscode";
import {injectable} from "inversify";

@injectable()
export class ContextImpl implements Context {
    showPreTestedCommitButton(show: boolean) {
        commands.executeCommand("setContext", "teamcity-show-pretested-commit", show);
    }
}
