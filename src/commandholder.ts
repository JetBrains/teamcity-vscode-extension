"use strict";

export interface CommandHolder {
    signIn(): Promise<void>;
    selectFilesForRemoteRun(): Promise<void>;
    getSuitableConfigs(): Promise<void>;
    remoteRunWithChosenConfigs(): Promise<void>;
    showOutput(): void;
}
