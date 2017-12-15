"use strict";

import { FileTokenStorage } from "./file-token-storage";

import * as os from "os";
import * as path from "path";
import {Credentials} from "../credentials";
import {PersistentStorage} from "../persistentstorage";
import {Logger} from "../../utils/logger";
import {injectable} from "inversify";

/*
    Provides the ICredentialStore API on top of file-based storage.
    Does not support any kind of 'prefix' of the credential (since its
    storage mechanism is not shared with either Windows or OSX).

    User must provide a custom folder and custom file name for storage.
 */

@injectable()
export class LinuxFileApi implements PersistentStorage {
    private fileTokenStorage: FileTokenStorage;
    public static readonly SERVICE_PREFIX = "teamcity_vscode:";
    private defaultFilename: string = "secrets.json";
    private defaultFolder: string = ".secrets";

    constructor() {
        const folder = this.defaultFolder;
        const filename = this.defaultFilename;
        this.fileTokenStorage = new FileTokenStorage(path.join(path.join(os.homedir(), folder, filename)));
    }

    public async getCredentials() : Promise<Credentials> {
        let credentials: Credentials;
        const entries = await this.loadTeamCityCredentials();

        if (entries.length > 0) {
            credentials = this.createCredential(entries[0]);
        }

        if (entries.length > 1) {
            Logger.logWarning("[LinuxFileApi::getCredentials] there are more then one suitable credentials for the user! " +
            "The first will be taken.");
        }
        return credentials;
    }

    public async setCredentials(url: string, username: string, password: string) : Promise<void> {
        const existingEntries = await this.loadCredentialsExceptTeamCity();

        const newEntry = {
            username: username,
            password: password,
            url: url,
            service: LinuxFileApi.SERVICE_PREFIX
        };

        await this.fileTokenStorage.addEntries([newEntry], existingEntries);
    }

    public async removeCredentials() : Promise<void> {
        const existingEntries = await this.loadCredentialsExceptTeamCity();

        await this.fileTokenStorage.removeEntries(existingEntries);
    }

    private createCredential(credentials: any) : Credentials {
        return new Credentials(credentials.url, credentials.username, credentials.password, undefined, undefined);
    }

    private async loadTeamCityCredentials(): Promise<any> {
        return this.loadCredentials(true);
    }

    private async loadCredentialsExceptTeamCity(): Promise<any> {
        return this.loadCredentials(false);
    }

    private async loadCredentials(isTeamCityEntries: boolean) {
        const allEntries = this.fileTokenStorage.loadEntries();
        if (!allEntries || allEntries.length === 0) {
            return [];
        }

        const userEntries = [];
        allEntries.forEach((entry) => {
            if (isTeamCityEntries && entry.service === LinuxFileApi.SERVICE_PREFIX) {
                userEntries.push(entry);
            } else if (!isTeamCityEntries && entry.service !== LinuxFileApi.SERVICE_PREFIX) {
                userEntries.push(entry);
            }
        });

        return userEntries;
    }
}
