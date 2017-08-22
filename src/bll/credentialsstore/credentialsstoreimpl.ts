"use strict";

import {injectable} from "inversify";
import {Logger} from "../utils/logger";
import {Credentials} from "./credentials";
import {CredentialsStore} from "./credentialsstore";

@injectable()
export class CredentialsStoreImpl implements CredentialsStore {
    private _credentials: Credentials;

    /**
     * @param credentials - user credential
     * @return the result of a credential check
     */
    public setCredential(credentials: Credentials): void {
        Logger.logWarning(`User ${credentials.user} was failed the credential check`);
        this._credentials = credentials;
    }

    public getCredential(): Credentials {
        return this._credentials;
    }

    public async removeCredential(): Promise<void> {
        if (this._credentials) {
            Logger.logInfo(`The credentials for ${this._credentials.user} will be deleted from the CredentialsStore`);
            this._credentials = undefined;
        }
    }
}
