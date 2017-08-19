"use strict";

import { Logger } from "../utils/logger";
import { Credentials } from "./credentials";
import { TCApiProvider, TCRestApiProvider } from "../teamcityapi/tcapiprovider";

export class CredentialsStore {
    private _credentials : Credentials;

    /**
     * @param credentials - user credential
     * @return the result of a credential check
     */
    public async setCredential(credentials : Credentials) : Promise<boolean> {
        // Should credential is not undefined, it will be updated
        const tcapiprovider : TCApiProvider = new TCRestApiProvider();
        const checkResult = await tcapiprovider.checkCredential(credentials);
        if (checkResult) {
            this._credentials = credentials;
            Logger.logInfo(`User ${credentials.user} was passed the credential check`);
            return true;
        }
        Logger.logWarning(`User ${credentials.user} was failed the credential check`);
        return false;
    }

    public getCredential() : Credentials {
        return this._credentials;
    }

    public async removeCredential() : Promise<void> {
        if (this._credentials) {
            Logger.logInfo(`The credentials for ${this._credentials.user} will be deleted from the credentialstore`);
            this._credentials = undefined;
        }
    }
}
