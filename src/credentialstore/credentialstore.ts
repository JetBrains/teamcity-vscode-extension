"use strict";

import { Credential } from "./credential";
import { TCApiProvider, TCRestApiProvider } from "../teamcityapi/tcapiprovider";

export class CredentialStore {
    private _creds : Credential;

    public async setCredential(creds : Credential) : Promise<void> {
        // Should credential is not undefined, it will be updated
        const tcapiprovider : TCApiProvider = new TCRestApiProvider();
        const checkResult = await tcapiprovider.checkCredential(creds);
        if (checkResult) {
            this._creds = creds;
        }
        return;
    }

    public getCredential() : Credential {
        return this._creds;
    }

    public async removeCredential() : Promise<void> {
        this._creds = undefined;
    }
}