"use struct";

import { Credential } from "./credential";

export class CredentialStore{
    private _credential : Credential;

    public async setCredential(serverURL: string, username: string, password: string) : Promise<void> {
        // Should credential is not undefined, it will be updated
        const credential = new Credential(serverURL, username, password);
        this._credential = credential;
    }

    public async getCredential() : Promise<Credential> {
        return this._credential;
    }

    public async removeCredential() : Promise<void> {
        this._credential = undefined;
    }
}