"use strict";

import {Logger} from "./bll/utils/logger";
import {TYPES} from "./bll/utils/constants";
import {inject, injectable} from "inversify";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {ExtensionManager} from "./extensionmanager";
import {TeamCityOutput} from "./view/teamcityoutput";
import {DataProviderManager} from "./view/dataprovidermanager";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {Disposable, ExtensionContext, OutputChannel, workspace, StatusBarItem, window, StatusBarAlignment} from "vscode";

@injectable()
export class ExtensionManagerImpl implements ExtensionManager {
    private _settings: Settings;
    private _credentialStore: CredentialsStore;
    private readonly _commandHolder: CommandHolder;
    private _notificationWatcher: NotificationWatcher;
    private readonly _disposables: Disposable[] = [];

    constructor(@inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.CredentialsStore) credentialStore: CredentialsStore,
                @inject(TYPES.CommandHolder) commandHolder: CommandHolder,
                @inject(TYPES.NotificationWatcher) notificationWatcher: NotificationWatcher) {
        this._settings = settings;
        this._credentialStore = credentialStore;
        this._commandHolder = commandHolder;
        this._commandHolder.init(settings, credentialStore);
        this._notificationWatcher = notificationWatcher;
        notificationWatcher.initAndActivate(credentialStore);
        this._disposables.push(notificationWatcher);
        DataProviderManager.init(this._disposables);
        TeamCityOutput.init(this._disposables);
        const loggingLevel: string = this._settings.loggingLevel;
        this.initLogger(loggingLevel, workspace.rootPath);
        TeamCityStatusBarItem.init(this._disposables);
    }

    public async executeSignIn(): Promise<void> {
        await this._commandHolder.signIn();
    }

    public cleanUp(): void {
        this._credentialStore.removeCredential();
        TeamCityStatusBarItem.setLoggedOut();
    }

    public dispose(): void {
        this.cleanUp();
        this._disposables.forEach((disposable) => disposable.dispose());
    }

    public get commandHolder(): CommandHolder {
        return this._commandHolder;
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
