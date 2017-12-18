"use strict";

import {Credentials} from "../credentials";
import {Logger} from "../../utils/logger";
import {WinPersistentCredentialsStore} from "./win-credstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../../utils/constants";
import {CredentialsStore} from "../credentialsstore";

@injectable()
export class WindowsCredentialStoreApi implements CredentialsStore {
    private static separator: string = "|";
    public static SERVICE_PREFIX = "teamcity_vscode:";
    private winPersistentCredentialsStore: WinPersistentCredentialsStore;

    constructor(@inject(TYPES.WinPersistentCredentialsStore) winPersistentCredentialsStore: WinPersistentCredentialsStore) {
        this.winPersistentCredentialsStore = winPersistentCredentialsStore;
        winPersistentCredentialsStore.setPrefix(WindowsCredentialStoreApi.SERVICE_PREFIX);
    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials;
        const credentialsList: any[] = await this.listCredentials();
        if (credentialsList.length > 0) {
            credentials = WindowsCredentialStoreApi.createCredentials(credentialsList[0]);
        }
        if (credentialsList.length > 1) {
            Logger.logWarning("[WindowsCredentialStoreApi::getCredential] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }
        return credentials;
    }

    public setCredentials(credentials: Credentials): Promise<void> {
        const targetName: string = WindowsCredentialStoreApi.createTargetName(credentials.serverURL, credentials.user);
        return this.winPersistentCredentialsStore.set(targetName, credentials.password);
    }

    public async removeCredentials(): Promise<void> {
        const removeAllCredentialsWithPrefixMask: string = "*";
        try {
            await this.winPersistentCredentialsStore.remove(removeAllCredentialsWithPrefixMask);
        } catch (err) {
            if (!WindowsCredentialStoreApi.isCredentialsNotFoundCode(err)) {
                throw err;
            }
        }
    }

    private static isCredentialsNotFoundCode(err: any): boolean {
        const CREDENTIALS_ARE_NOT_FOUND_CODE: number = 1168;
        return err.code !== undefined && err.code === CREDENTIALS_ARE_NOT_FOUND_CODE;
    }

    private static createCredentials(cred: any): Credentials {
        const password: string = new Buffer(cred.credential, "hex").toString("utf8");
        const segments: Array<string> = cred.targetName.split(WindowsCredentialStoreApi.separator);
        const url: string = segments[0];
        const username: string = segments[1];
        return new Credentials(url, username, password, undefined, undefined);
    }

    private static createTargetName(service: string, username: string): string {
        return service + WindowsCredentialStoreApi.separator + username;
    }

    private listCredentials(): Promise<Array<any>> {
        const credentials: Array<any> = [];
        return new Promise((resolve, reject) => {
            const stream = this.winPersistentCredentialsStore.getCredentialsListStream();
            stream.on("data", (cred) => {
                credentials.push(cred);
            });
            stream.on("end", () => {
                resolve(credentials);
            });
            stream.on("error", (error) => {
                Logger.logError(error);
                reject(error);
            });
        });
    }

    getCredentialsSilently(): Credentials {
        throw new Error("Method not supported.");
    }
}
