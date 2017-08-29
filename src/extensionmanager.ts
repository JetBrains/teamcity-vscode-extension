"use strict";

import {Disposable} from "vscode";
import {CommandHolder} from "./commandholder";

export interface ExtensionManager extends Disposable {
    commandHolder: CommandHolder;
    cleanUp(): void;
    executeSignIn(): Promise<void>;
}
