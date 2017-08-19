"use strict";

import { Logger } from "./utils/logger";
import { CommandHolder } from "./commandholder";
import { Settings, SettingsImpl } from "./entities/settings";
import { CredentialsStore } from "./credentialsstore/credentialsstore";
import { BuildConfigTreeDataProvider } from "./remoterun/configexplorer";
import { NotificationWatcher } from "./notifications/notificationwatcher";
import { Disposable, window, OutputChannel, workspace, ExtensionContext } from "vscode";

export class ExtensionManager implements Disposable {
    private _settings : Settings;
    private _credentialStore : CredentialsStore;
    private _commandHolder : CommandHolder;
    private _configurationExplorer : BuildConfigTreeDataProvider;
    private _notificationWatcher : NotificationWatcher;
    private _outputChannal : OutputChannel;

    public async Initialize(configExplorer: BuildConfigTreeDataProvider) : Promise<void> {
        this._settings = new SettingsImpl();
        this._configurationExplorer = configExplorer;
        this._credentialStore = new CredentialsStore();
        this._commandHolder = new CommandHolder(this);
        this._outputChannal = window.createOutputChannel("TeamCity");
        this._notificationWatcher = new NotificationWatcher(this._credentialStore, this._outputChannal);
        const loggingLevel : string = this._settings.loggingLevel;
        this.initLogger(loggingLevel, workspace.rootPath);
    }

    public cleanUp() : void {
        //TODO: clean up extention data
        this._notificationWatcher.resetData();
        this._credentialStore.removeCredential();
    }

    public dispose() : void {
        this.cleanUp();
    }

    public get commandHolder() : CommandHolder {
        return this._commandHolder;
    }

    public get credentialStore() : CredentialsStore {
        return this._credentialStore;
    }

    public get configurationExplorer() : BuildConfigTreeDataProvider {
        return this._configurationExplorer;
    }

    public get notificationWatcher() : NotificationWatcher {
        return this._notificationWatcher;
    }

    public get settings() : Settings {
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
            Logger.logInfo(`Should show signin welcome message: ${this._settings.showSignInWelcome}`);
        } else {
            Logger.logWarning(`Folder not opened!`);
        }
    }
}
