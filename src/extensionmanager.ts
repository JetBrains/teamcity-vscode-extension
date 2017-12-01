"use strict";

import {Logger} from "./bll/utils/logger";
import {TYPES} from "./bll/utils/constants";
import {inject, injectable} from "inversify";
import {CommandHolder} from "./commandholder";
import {Settings} from "./bll/entities/settings";
import {Output} from "./view/output";
import {DataProviderManager} from "./view/dataprovidermanager";
import {TeamCityStatusBarItem} from "./view/teamcitystatusbaritem";
import {CredentialsStore} from "./bll/credentialsstore/credentialsstore";
import {NotificationWatcher} from "./bll/notifications/notificationwatcher";
import {
    Disposable,
    ExtensionContext,
    OutputChannel,
    StatusBarAlignment,
    StatusBarItem,
    workspace,
    commands
} from "vscode";
import {ProviderManager} from "./view/providermanager";

@injectable()
export class ExtensionManager {
    private credentialsStore: CredentialsStore;
    private readonly _commandHolder: CommandHolder;
    private _notificationWatcher: NotificationWatcher;
    private readonly _disposables: Disposable[] = [];
    private readonly providerManager: ProviderManager;

    constructor(@inject(TYPES.Settings) settings: Settings,
                @inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                @inject(TYPES.CommandHolder) commandHolder: CommandHolder,
                @inject(TYPES.NotificationWatcher) notificationWatcher: NotificationWatcher,
                @inject(TYPES.Output) output: Output,
                @inject(TYPES.ProviderManager) providerManager: ProviderManager) {
        this.credentialsStore = credentialsStore;
        this._commandHolder = commandHolder;
        this._notificationWatcher = notificationWatcher;
        notificationWatcher.activate();
        this._disposables.push(notificationWatcher);
        this._disposables.push(output);
        DataProviderManager.init(this._disposables);
        this.initLogger(settings.loggingLevel, workspace.rootPath);
        TeamCityStatusBarItem.init(this._disposables);
        this._disposables.push(providerManager);
        this.providerManager = providerManager;
    }

    public refreshAllProviders() {
        this.providerManager.refreshAll();
    }

    public dispose(): void {
        this.commandHolder.signOut();
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
            Logger.logInfo(`Logging level: ${loggingLevel}`);
        } else {
            Logger.logWarning(`Folder not opened!`);
        }
    }
}
