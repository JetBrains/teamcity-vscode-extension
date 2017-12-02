"use strict";

import {Credentials} from "../credentials";
import {Logger} from "../../utils/logger";
import {PersistentStorage} from "../persistentstorage";
import {WinPersistentCredentialsStore} from "./win-credstore";

export class WindowsCredentialStoreApi implements PersistentStorage {
    private static separator: string = "|";
    public static SERVICE_PREFIX = "teamcity_vscode:";

    constructor() {
        WinPersistentCredentialsStore.setPrefix(WindowsCredentialStoreApi.SERVICE_PREFIX);
    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials;
        const credentialsList: any[] = await this.listCredentials();
        if (credentialsList.length > 0) {
            credentials = this.createCredentials(credentialsList[0]);
        }
        if (credentialsList.length > 1) {
            Logger.logWarning("[WindowsCredentialStoreApi::getCredential] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }

        return credentials;
    }

    public setCredentials(url: string, username: string, password: any): Promise<void> {
        const targetName: string = this.createTargetName(url, username);
        return new Promise((resolve, reject) => {
            WinPersistentCredentialsStore.set(targetName, password, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    // On Windows, "*" will delete all matching credentials in one go
    public removeCredentials(): Promise<void> {
        const maskFileToRemove: string = "*";
        return new Promise((resolve, reject) => {
            WinPersistentCredentialsStore.remove(maskFileToRemove, function (err) {
                if (err) {
                    if (this.isCredentialsNotFoundCode()) {
                        resolve(undefined);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    public isCredentialsNotFoundCode(err: any): boolean {
        const CREDENTIALS_ARE_NOT_FOUND_CODE: number = 1168;
        return err.code !== undefined && err.code === CREDENTIALS_ARE_NOT_FOUND_CODE;
    }

    // Adding for test purposes (to ensure a particular credential doesn't exist)
    public async getCredentialsByName(username: string): Promise<Credentials> {
        let credentials: Credentials;
        const credentialsList: any[] = await this.listCredentials();
        if (credentialsList.length > 0) {
            credentials = this.createCredentials(credentialsList[0]);
        }
        if (credentialsList.length > 1) {
            Logger.logWarning("[WindowsCredentialStoreApi::getCredential] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }

        return credentials;
    }

    public removeCredentialsByName(username: string): Promise<void> {
        const maskFileToRemove: string = this.createTargetName("", username);
        return new Promise((resolve, reject) => {
            WinPersistentCredentialsStore.remove(maskFileToRemove, function (err) {
                if (err) {
                    if (this.isCredentialsNotFoundCode()) {
                        resolve(undefined);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    private createCredentials(cred: any): Credentials {
        const password: string = new Buffer(cred.credential, "hex").toString("utf8");
        const segments: Array<string> = cred.targetName.split(WindowsCredentialStoreApi.separator);
        const url: string = segments[0];
        const username: string = segments[1];
        return new Credentials(url, username, password, undefined, undefined);
    }

    private createTargetName(service: string, username: string): string {
        return service + WindowsCredentialStoreApi.separator + username;
    }

    private listCredentials(): Promise<Array<any>> {
        const credentials: Array<any> = [];
        return new Promise((resolve, reject) => {
            const stream = WinPersistentCredentialsStore.list();
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
}
