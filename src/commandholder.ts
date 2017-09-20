"use strict";

import {Settings} from "./bll/entities/settings";
import {TeamCityOutput} from "./view/teamcityoutput";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";

export interface CommandHolder {
    signIn(): Promise<boolean>;
    selectFilesForRemoteRun(): Promise<void>;
    getSuitableConfigs(): Promise<void>;
    remoteRunWithChosenConfigs(): Promise<void>;
    showOutput(): void;
}
