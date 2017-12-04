"use strict";

import {WindowsCredentialStoreApi} from "./win32/win-credstore-api";
import {PersistentStorage} from "./persistentstorage";
import {Credentials} from "./credentials";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {Os} from "../moduleinterfaces/os";

@injectable()
export class PersistentStorageManager implements PersistentStorage {

    private credentialsStore: PersistentStorage;

    public constructor(@inject(TYPES.WindowsCredentialStoreApi) windowsCredentialsStoreApi: WindowsCredentialStoreApi,
                       @inject(TYPES.WindowsCredentialStoreApi) linuxCredentialsStoreApi: PersistentStorage,
                       @inject(TYPES.WindowsCredentialStoreApi) macCredentialsStoreApi: PersistentStorage,
                       @inject(TYPES.OsProxy) os: Os) {

        switch (os.platform()) {
            case "win32":
                this.credentialsStore = windowsCredentialsStoreApi;
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

    public async setCredentials(url: string, username: string, password: any): Promise<void> {
        const cred: Credentials = await this.getCredentials();
        if (cred) {
            await this.removeCredentials();
        }
        await this.credentialsStore.setCredentials(url, username, password);
    }

    public removeCredentials(): Promise<void> {
        return this.credentialsStore.removeCredentials();
    }

}
