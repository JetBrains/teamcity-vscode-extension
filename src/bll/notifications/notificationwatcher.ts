"use strict";

import {OutputChannel} from "vscode";
import {CredentialsStore} from "../credentialsstore/credentialsstore";

export interface NotificationWatcher {

    init(credentialStore: CredentialsStore): void;

    /**
     * This method activates Notification Watcher. Since user is signed in, it will check if eventCounter is changed.
     * Frequency of requests on server is settled by CHECK_FREQUENCY_MS.
     */
    activate(): Promise<void>;

    /**
     * This method resets all contained data.
     */
    resetData(): void;
}
