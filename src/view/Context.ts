import {Disposable} from "vscode";

export interface Context extends Disposable {
    showPreTestedCommitButton(show: boolean);
    setQueueAtTop(value: boolean);
    setSignIn(value: boolean);
}
