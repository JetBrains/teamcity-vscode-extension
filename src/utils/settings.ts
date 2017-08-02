"use strict";

import { workspace, ExtensionContext, Memento } from "vscode";
import { Constants } from "./constants";

export interface Settings {
    loggingLevel: string;

    /**
     * showSignInWelcome field has only a getter
     * To change this value use setShowSignInWelcome method
     */
    showSignInWelcome: boolean;
    setShowSignInWelcome(newValue: boolean): Promise<void>;
}

export abstract class BaseSettings {

    public async setSettingsProperty(key: string, value: any, global?: boolean): Promise<void> {
        const configuration = workspace.getConfiguration();
        const prom : Promise<void> = new Promise((resolve, reject) => {
            configuration.update(key, value, global).then(() => {
                resolve();
            });
        });
        return prom;
    }

    public getSettingsProperty<T>(key: string, defaultValue?:T): T {
        const configuration = workspace.getConfiguration();
        const value = configuration.get<T>(key, defaultValue);
        return value;
    }

}

export class SettingsImpl extends BaseSettings implements Settings {
    private readonly _loggingLevel : string;
    private _showSignInWelcome : boolean;

    constructor() {
        super();
        this._loggingLevel = this.getSettingsProperty<string>(Constants.LOGGING_LEVEL_SETTING_KEY, undefined);
        this._showSignInWelcome = this.getSettingsProperty<boolean>(Constants.SIGNIN_WELCOME_SETTING_KEY, true);
    }

    public get loggingLevel() : string {
        return this._loggingLevel;
    }

    public get showSignInWelcome() : boolean {
        return this._showSignInWelcome;
    }

    /**
     * If undefined then signInWelcomeMessage = true
     */
    public async setShowSignInWelcome(newValue : boolean) : Promise<void> {
        await this.setSettingsProperty(Constants.SIGNIN_WELCOME_SETTING_KEY, newValue, true /* global */);
        this._showSignInWelcome = newValue !== undefined ? newValue : true;
        return;
    }

    /**
     * The object that provids api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject() : any {
        const testObject : any = {};
        testObject.getSettingsProperty = this.getSettingsProperty;
        return testObject;
    }
}
