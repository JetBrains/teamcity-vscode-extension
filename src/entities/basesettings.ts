"use strict";

import {workspace} from "vscode";

export abstract class BaseSettings {

    protected static async setSettingsProperty(key: string, value: any, global?: boolean): Promise<void> {
        const configuration = workspace.getConfiguration();
        return configuration.update(key, value, global);
    }

    protected static getSettingsProperty<T>(key: string, defaultValue?: T): T {
        const configuration = workspace.getConfiguration();
        return configuration.get<T>(key, defaultValue);
    }
}
