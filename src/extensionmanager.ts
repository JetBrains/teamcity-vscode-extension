"use strict";

import {Disposable} from "vscode";

export interface ExtensionManager extends Disposable {
    commandHolder: any;
    cleanUp(): void;
    executeSignIn(): Promise<void>;
}
