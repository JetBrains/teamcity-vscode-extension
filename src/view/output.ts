"use strict";

import {OutputChannel, window, Disposable} from "vscode";

export interface Output extends Disposable {
    show();
    appendLine(line: string);
}
