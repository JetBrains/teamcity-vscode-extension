"use strict";

import { Credential } from "./credential";
import { TCApiProvider, TCRestApiProvider } from "../teamcityapi/tcapiprovider";
import { Logger } from "../utils/logger";

export class CredentialStore {
    private _creds : Credential;

    /**
     * @param creds - user credential
     * @return the result of a credential check
     */
    public async setCredential(creds : Credential) : Promise<boolean> {
        // Should credential is not undefined, it will be updated
        const tcapiprovider : TCApiProvider = new TCRestApiProvider();
        const checkResult = await tcapiprovider.checkCredential(creds);
        if (checkResult) {
            this._creds = creds;
            Logger.logInfo(`User ${creds.user} was passed the credential check`);
            return true;
        }
        Logger.logWarning(`User ${creds.user} was failed the credential check`);
        return false;
    }

    public getCredential() : Credential {
        return this._creds;
    }

    public async removeCredential() : Promise<void> {
        if (this._creds) {
            Logger.logInfo(`The credentials for ${this._creds.user} will be deleted from the credentialstore`);
            this._creds = undefined;
        }
    }
}
