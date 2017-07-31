"use strict";

import { Disposable, window, OutputChannel } from "vscode";
import { CredentialStore } from "./credentialstore/credentialstore";
import { CommandHolder } from "./commandholder";
import { BuildConfigTreeDataProvider } from "./remoterun/configexplorer";
import { NotificationWatcher } from "./notifications/notificationwatcher";

export class ExtensionManager implements Disposable {
    private _credentialStore : CredentialStore;
    private _commandHolder : CommandHolder;
    private _configExplorer : BuildConfigTreeDataProvider;
    private _notificationWatcher : NotificationWatcher;
    private _outputChannal : OutputChannel;

    public async Initialize(configExplorer: BuildConfigTreeDataProvider) : Promise<void> {
        this._configExplorer = configExplorer;
        this._credentialStore = new CredentialStore();
        this._commandHolder = new CommandHolder(this);
        this._outputChannal = window.createOutputChannel("TeamCity");
        this._notificationWatcher = new NotificationWatcher(this._credentialStore, this._outputChannal);
    }

    public runCommand(funcToTry: (args) => void, ...args: string[]): void {
        funcToTry(args);
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

    public get credentialStore() : CredentialStore {
        return this._credentialStore;
    }

    public get configExplorer() : BuildConfigTreeDataProvider {
        return this._configExplorer;
    }

    public get notificationWatcher() : NotificationWatcher {
        return this._notificationWatcher;
    }
}
