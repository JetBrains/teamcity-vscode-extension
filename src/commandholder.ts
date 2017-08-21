"use strict";

import {Settings} from "./interfaces/settings";
import {CredentialsStore} from "./credentialsstore/credentialsstore";

export interface CommandHolder {
    init(settings: Settings, credentialsStore: CredentialsStore): void;
    signIn(): Promise<boolean>;
    selectFilesForRemoteRun(): Promise<void>;
    getSuitableConfigs(): Promise<void>;
    remoteRunWithChosenConfigs(): Promise<void>;
}
