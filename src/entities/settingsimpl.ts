"use strict";

import {Constants} from "../utils/constants";
import {injectable} from "inversify";
import {Settings} from "../interfaces/settings";
import {workspace} from "vscode";

@injectable()
export class SettingsImpl implements Settings {
    private readonly _loggingLevel: string;
    private _showSignInWelcome: boolean;
    private _lastUrl: string;
    private _lastUsername: string;

    constructor() {
        this.setEnableRemoteRun(undefined);
        this._loggingLevel = SettingsImpl.getSettingsProperty<string>(Constants.LOGGING_LEVEL_SETTING_KEY, undefined);
        this._showSignInWelcome = SettingsImpl.getSettingsProperty<boolean>(Constants.SIGNIN_WELCOME_SETTING_KEY, true);
        this._lastUrl = SettingsImpl.getSettingsProperty<string>(Constants.DEFAULT_USER_URL, "");
        this._lastUsername = SettingsImpl.getSettingsProperty<string>(Constants.DEFAULT_USER_NAME, "");
    }

    private static async setSettingsProperty(key: string, value: any, global?: boolean): Promise<void> {
        const configuration = workspace.getConfiguration();
        return configuration.update(key, value, global);
    }

    private static getSettingsProperty<T>(key: string, defaultValue?: T): T {
        const configuration = workspace.getConfiguration();
        return configuration.get<T>(key, defaultValue);
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
        await SettingsImpl.setSettingsProperty(Constants.SIGNIN_WELCOME_SETTING_KEY, newValue, true /* global */);
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
        await SettingsImpl.setSettingsProperty(Constants.DEFAULT_USER_URL, url, true /* global */);
        this._lastUrl = url;
    }

    public async setLastUsername(username: string): Promise<void> {
        await SettingsImpl.setSettingsProperty(Constants.DEFAULT_USER_NAME, username, true /* global */);
        this._lastUsername = username;
    }

    public async setEnableRemoteRun(enableRemoteRun: boolean): Promise<void> {
        await SettingsImpl.setSettingsProperty(Constants.REMOTERUN_ENABLED, enableRemoteRun, false /* global */);
    }
}
