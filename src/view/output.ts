import {Disposable} from "vscode";

export interface Output extends Disposable {
    show();
    appendLine(line: string);
}
