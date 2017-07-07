"use struct";

import { Disposable} from "vscode";
import { CredentialStore } from "./credentialstore/credentialstore";
import { CommandHolder } from "./commandholder";

export class ExtensionManager implements Disposable {
    private _credentialStore : CredentialStore;
    private _commandHolder : CommandHolder;

    public async Initialize() : Promise<void> {
        this._credentialStore = new CredentialStore(); 
        this._commandHolder = new CommandHolder(this);
    }

    public runCommand(funcToTry: (args) => void, ...args: string[]): void {
        funcToTry(args);
    }

    public cleanUp() : void {
        //TODO: clean up extention data
        this._credentialStore.removeCredential();
    }

    public dispose() : void {
        this.cleanUp();
    }

    public get commandHolder() : CommandHolder {
        return this._commandHolder;
    }

    public get credentialStore() : CredentialStore{
        return this._credentialStore;
    }
}