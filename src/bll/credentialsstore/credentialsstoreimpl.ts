"use strict";

import {injectable} from "inversify";
import {Logger} from "../utils/logger";
import {Credentials} from "./credentials";
import {CredentialsStore} from "./credentialsstore";

@injectable()
export class CredentialsStoreImpl implements CredentialsStore {
    private _credentials: Credentials;

    public setCredential(credentials: Credentials): void {
        this._credentials = credentials;
    }

    public getCredential(): Credentials {
        return this._credentials;
    }

    public removeCredential(): void {
        if (this._credentials) {
            Logger.logInfo(`The credentials for ${this._credentials.user} will be deleted from the CredentialsStore`);
            this._credentials = undefined;
        }
    }
}
