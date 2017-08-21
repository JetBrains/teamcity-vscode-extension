"use strict";

import {Logger} from "./utils/logger";
import {CommandHolder} from "./commandholder";
import {Settings} from "./interfaces/settings";
import {CredentialsStore} from "./credentialsstore/credentialsstore";
import {NotificationWatcher} from "./notifications/notificationwatcher";
import {Disposable, ExtensionContext, OutputChannel, workspace} from "vscode";
import {SettingsImpl} from "./entities/settingsimpl";
import {TeamCityOutput} from "./view/teamcityoutput";
import {DataProviderManager} from "./view/dataprovidermanager";

export class ExtensionManager implements Disposable {
    private _settings: Settings;
    private _credentialStore: CredentialsStore;
    private _commandHolder: CommandHolder;
    private _notificationWatcher: NotificationWatcher;
    private readonly _disposables : Disposable[] = [];

    public async Initialize(): Promise<void> {
        this._settings = new SettingsImpl();
        this._credentialStore = new CredentialsStore();
        this._commandHolder = new CommandHolder(this);
        DataProviderManager.init(this._disposables);
        TeamCityOutput.init(this._disposables);
        this._notificationWatcher = new NotificationWatcher(this._credentialStore);
        const loggingLevel: string = this._settings.loggingLevel;
        this.initLogger(loggingLevel, workspace.rootPath);
    }

    public cleanUp(): void {
        //TODO: clean up extension data
        this._notificationWatcher.resetData();
        this._credentialStore.removeCredential();
    }

    public dispose(): void {
        this.cleanUp();
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    public get commandHolder(): CommandHolder {
        return this._commandHolder;
    }

    public get credentialStore(): CredentialsStore {
        return this._credentialStore;
    }

    public get notificationWatcher(): NotificationWatcher {
        return this._notificationWatcher;
    }

    public get settings(): Settings {
        return this._settings;
    }

    private initLogger(loggingLevel: string, rootPath: string): void {
        if (loggingLevel === undefined) {
            return;
        }
        Logger.SetLoggingLevel(loggingLevel);
        if (rootPath !== undefined) {
            Logger.LogPath = rootPath;
            Logger.logInfo(`Logger path: ${rootPath}`);
            Logger.logInfo(`Logging level: ${this._settings.loggingLevel}`);
            Logger.logInfo(`Should show signIn welcome message: ${this._settings.showSignInWelcome}`);
        } else {
            Logger.logWarning(`Folder not opened!`);
        }
    }
}
