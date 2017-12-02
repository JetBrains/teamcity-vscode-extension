"use strict";

import * as os from "os";
import {WindowsCredentialStoreApi} from "./win32/win-credstore-api";
import {PersistentStorage} from "./persistentstorage";
import {Credentials} from "./credentials";
import {injectable} from "inversify";

@injectable()
export class PersistentStorageManager {

    private credentialsStore: PersistentStorage;

    public constructor() {

        switch (os.platform()) {
            case "win32":
                this.credentialsStore = new WindowsCredentialStoreApi();
                break;
            case "darwin":
                throw new Error("Not supported operation.");
            /* tslint:disable:no-switch-case-fall-through */
            case "linux":
            default:
                /* tslint:enable:no-switch-case-fall-through */
                throw new Error("Not supported operation.");
        }
    }

    public async getCredentials(): Promise<Credentials> {
        return this.credentialsStore.getCredentials();
    }

    public async setCredential(url: string, username: string, password: any): Promise<void> {
        const cred: Credentials = await this.getCredentials();
        if (!cred) {
            await this.removeCredentials();
        }
        await this.credentialsStore.setCredentials(url, username, password);
    }

    public removeCredentials(): Promise<void> {
        return this.credentialsStore.removeCredentials();
    }

}
