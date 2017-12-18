"use strict";

import {Credentials} from "../credentials";
import {Logger} from "../../utils/logger";
import {PersistentStorage} from "../persistentstorage";
import {OsxKeychain} from "./osx-keychain-access";
import {inject, injectable} from "inversify";
import {TYPES} from "../../utils/constants";

@injectable()
export class OsxKeychainApi implements PersistentStorage {
    private prefix: string = "teamcity_vscode:";
    private static separator: string = "|";

    private osxKeychain: OsxKeychain;

    constructor(@inject(TYPES.OsxKeychain) osxKeychain: OsxKeychain) {
        this.osxKeychain = osxKeychain;
        this.osxKeychain.setPrefix(this.prefix);

    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials;
        const credentialsList: Credentials[] = await this.listCredentials();

        if (credentialsList.length > 0) {
            credentials = credentialsList[0];
        }

        if (credentialsList.length > 1) {
            Logger.logWarning("[OsxKeychainApi::getCredential] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }

        if (credentials) {
            const password: string = await this.getPasswordFromKeyChain(credentials);
            return new Credentials(credentials.serverURL, credentials.user, password, undefined, undefined);
        }
    }

    private getPasswordFromKeyChain(credentials: Credentials): Promise<string> {
        const targetName: string = OsxKeychainApi.createTargetName(credentials.serverURL, credentials.user);
        return this.osxKeychain.getPasswordForUser(targetName);
    }

    public setCredentials(url: string, username: string, password: string): Promise<void> {
        const targetName: string = OsxKeychainApi.createTargetName(url, username);
        return this.osxKeychain.set(targetName, "", password);
    }

    public async removeCredentials(): Promise<void> {
        const credentialsList: Credentials[] = await this.listCredentials();

        if (credentialsList && credentialsList.length > 0) {
            for (let i = 0; i < credentialsList.length; i++) {
                const credentials: Credentials = credentialsList[i];
                await this.removeCredentialByName(credentials.user);
            }
        }
    }

    public async removeCredentialByName(username: string): Promise<void> {
        const description = "";
        try {
            await this.osxKeychain.remove(username, description);
        } catch (err) {
            const CREDENTIALS_NOT_FOUND_CODE = 44;
            if (err.code && err.code !== CREDENTIALS_NOT_FOUND_CODE) {
                throw err;
            }
        }
    }

    private listCredentials(): Promise<Credentials[]> {
        const credentialsList: Credentials[] = [];

        const stream = this.osxKeychain.getCredentialsWithoutPasswordsListStream();
        stream.on("data", (cred) => {
            if (cred.svce && cred.svce.indexOf(this.prefix) === 0) {
                const credentials: Credentials = OsxKeychainApi.createCredentialsWithoutPassword(cred.acct);
                credentialsList.push(credentials);
            }
        });
        return new Promise<Credentials[]>((resolve, reject) => {
            stream.on("end", () => {
                resolve(credentialsList);
            });
            stream.on("error", (error) => {
                console.log(error);
                reject(error);
            });
        });
    }

    private static createCredentialsWithoutPassword(targetName: string): Credentials {
        const segments: Array<string> = targetName.split(OsxKeychainApi.separator);
        const url: string = segments[0];
        const username: string = segments[1];
        return new Credentials(url, username, undefined, undefined, undefined);
    }

    private static createTargetName(url: string, username: string): string {
        return url + OsxKeychainApi.separator + username;
    }
}
