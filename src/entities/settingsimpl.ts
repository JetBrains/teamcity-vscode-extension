"use strict";

import {BaseSettings} from "./basesettings";
import {Settings} from "../interfaces/settings";
import {Constants} from "../utils/constants";

export class SettingsImpl extends BaseSettings implements Settings {
    private readonly _loggingLevel: string;
    private _showSignInWelcome: boolean;
    private _lastUrl: string;
    private _lastUsername: string;

    constructor() {
        super();
        this.setEnableRemoteRun(undefined);
        this._loggingLevel = BaseSettings.getSettingsProperty<string>(Constants.LOGGING_LEVEL_SETTING_KEY, undefined);
        this._showSignInWelcome = BaseSettings.getSettingsProperty<boolean>(Constants.SIGNIN_WELCOME_SETTING_KEY, true);
        this._lastUrl = BaseSettings.getSettingsProperty<string>(Constants.DEFAULT_USER_URL, "");
        this._lastUsername = BaseSettings.getSettingsProperty<string>(Constants.DEFAULT_USER_NAME, "");
    }

    public get loggingLevel(): string {
        return this._loggingLevel;
    }

    public get showSignInWelcome(): boolean {
        return this._showSignInWelcome;
    }

    /**
     * If undefined then signInWelcomeMessage = true
     */
    public async setShowSignInWelcome(newValue: boolean): Promise<void> {
        await BaseSettings.setSettingsProperty(Constants.SIGNIN_WELCOME_SETTING_KEY, newValue, true /* global */);
        this._showSignInWelcome = newValue !== undefined ? newValue : true;
        return;
    }

    public getLastUrl(): string {
        return this._lastUrl;

    }

    public getLastUsername(): string {
        return this._lastUsername;
    }

    public async setLastUrl(url: string): Promise<void> {
        await BaseSettings.setSettingsProperty(Constants.DEFAULT_USER_URL, url, true /* global */);
        this._lastUrl = url;
    }

    public async setLastUsername(username: string): Promise<void> {
        await BaseSettings.setSettingsProperty(Constants.DEFAULT_USER_NAME, username, true /* global */);
        this._lastUsername = username;
    }

    public async setEnableRemoteRun(enableRemoteRun: boolean): Promise<void> {
        await BaseSettings.setSettingsProperty(Constants.REMOTERUN_ENABLED, enableRemoteRun, false /* global */);
    }

    /**
     * The object that provides api for private fields and methods of class.
     * Use for test purposes only!
     */
    public getTestObject(): any {
        const testObject: any = {};
        testObject.getSettingsProperty = BaseSettings.getSettingsProperty;
        return testObject;
    }
}
