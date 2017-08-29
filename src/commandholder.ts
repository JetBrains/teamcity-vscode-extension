"use strict";

import {Settings} from "./bll/entities/settings";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";

export interface CommandHolder {
    init(settings: Settings, credentialsStore: CredentialsStore): void;
    signIn(): Promise<boolean>;
    selectFilesForRemoteRun(): Promise<void>;
    getSuitableConfigs(): Promise<void>;
    remoteRunWithChosenConfigs(): Promise<void>;
    showOutput(): void;
}
