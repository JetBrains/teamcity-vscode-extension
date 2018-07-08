import {Disposable} from "vscode";

export interface NotificationWatcher extends Disposable {
    activate(): Promise<void>;
}
