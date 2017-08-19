"use strict";

import { Constants } from "../utils/constants";
import { workspace, ExtensionContext, Memento } from "vscode";

export interface Settings {
    loggingLevel: string;

    /**
     * showSignInWelcome field has only a getter
     * To change this value use setShowSignInWelcome method
     */
    showSignInWelcome: boolean;
    getLastUrl() : string;
    getLastUsername(): string;
    setLastUrl(url : string) : Promise<void>;
    setLastUsername(username : string): Promise<void>;
    setShowSignInWelcome(newValue: boolean): Promise<void>;
    setEnableRemoteRun(newValue: boolean): Promise<void>;
}

export abstract class BaseSettings {

    public async setSettingsProperty(key: string, value: any, global?: boolean): Promise<void> {
        const configuration = workspace.getConfiguration();
        return configuration.update(key, value, global);
    }

    public getSettingsProperty<T>(key: string, defaultValue?:T): T {
        const configuration = workspace.getConfiguration();
        return configuration.get<T>(key, defaultValue);
    }

}

export class SettingsImpl extends BaseSettings implements Settings {
    private readonly _loggingLevel: string;
    private _showSignInWelcome : boolean;
    private _lastUrl : string;
    private _lastUsername : string;

    constructor() {
        super();
        this.setEnableRemoteRun(undefined);
        this._loggingLevel = this.getSettingsProperty<string>(Constants.LOGGING_LEVEL_SETTING_KEY, undefined);
        this._showSignInWelcome = this.getSettingsProperty<boolean>(Constants.SIGNIN_WELCOME_SETTING_KEY, true);
        this._lastUrl = this.getSettingsProperty<string>(Constants.DEFAULT_USER_URL, "");
        this._lastUsername = this.getSettingsProperty<string>(Constants.DEFAULT_USER_NAME, "");
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

    public getLastUrl(): string {
        return this._lastUrl;

    }

    public getLastUsername(): string {
        return this._lastUsername;
    }

    public async setLastUrl(url : string) : Promise<void> {
        await this.setSettingsProperty(Constants.DEFAULT_USER_URL, url, true /* global */);
        this._lastUrl = url;
    }

    public async setLastUsername(username : string) : Promise<void> {
        await this.setSettingsProperty(Constants.DEFAULT_USER_NAME, username, true /* global */);
        this._lastUsername = username;
    }

    public async setEnableRemoteRun(enableRemoteRun : boolean) : Promise<void> {
        await this.setSettingsProperty(Constants.REMOTERUN_ENABLED, enableRemoteRun, false /* global */);
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
