"use strict";

import {Logger} from "./bll/utils/logger";
import {TYPES} from "./bll/utils/constants";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {inject, injectable} from "inversify";
import {TeamCityOutput} from "./view/teamcityoutput";
import {DataProviderManager} from "./view/dataprovidermanager";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {Disposable, ExtensionContext, OutputChannel, workspace} from "vscode";
import {ExtensionManager} from "./extensionmanager";

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
        notificationWatcher.init(credentialStore);
        DataProviderManager.init(this._disposables);
        TeamCityOutput.init(this._disposables);
        const loggingLevel: string = this._settings.loggingLevel;
        this.initLogger(loggingLevel, workspace.rootPath);
    }

    public async executeSignIn(): Promise<void> {
        if (await this._commandHolder.signIn()) {
            this._notificationWatcher.activate();
        }
    }

    public cleanUp(): void {
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
