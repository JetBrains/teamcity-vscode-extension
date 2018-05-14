import {Constants} from "../utils/constants";
import {injectable} from "inversify";
import {Settings} from "./settings";
import {workspace} from "vscode";

@injectable()
export class SettingsImpl implements Settings {
    private readonly _loggingLevel: string;
    private _showSignInWelcome: boolean;
    private _shouldAskStoreCredentials: boolean;
    private _lastLogin: string;

    constructor() {
        this._loggingLevel = SettingsImpl.getSettingsProperty<string>(Constants.LOGGING_LEVEL_SETTING_KEY, undefined);
        this._showSignInWelcome = SettingsImpl.getSettingsProperty<boolean>(Constants.SIGNIN_WELCOME_SETTING_KEY, true);
        this._shouldAskStoreCredentials = SettingsImpl.getSettingsProperty<boolean>(Constants.SHOULD_ASK_STORE_CREDENTIALS, true);
        this._lastLogin = SettingsImpl.getSettingsProperty<string>(Constants.LAST_LOGIN, "");
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
    public set showSignInWelcome(newValue: boolean) {
        this._showSignInWelcome = newValue !== undefined ? newValue : true;
        SettingsImpl.setSettingsProperty(Constants.SIGNIN_WELCOME_SETTING_KEY, newValue, true /* global */);
    }

    public shouldAskStoreCredentials(): boolean {
        return this._shouldAskStoreCredentials;
    }

    public async setShouldAskStoreCredentials(newValue: boolean): Promise<void> {
        await SettingsImpl.setSettingsProperty(Constants.SHOULD_ASK_STORE_CREDENTIALS, newValue, true);
        this._shouldAskStoreCredentials = newValue !== undefined ? newValue : true;
    }

    public get lastLogin(): string {
        return this._lastLogin;
    }

    public set lastLogin(targetName: string) {
        this._lastLogin = targetName;
        SettingsImpl.setSettingsProperty(Constants.LAST_LOGIN, targetName, true);
    }

    shouldCollectGitChangesFromIndex(): boolean {
        return SettingsImpl.getSettingsProperty<boolean>(Constants.SHOULD_COLLECT_CHANGES_FROM_INDEX, false);
    }
}
