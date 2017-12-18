"use strict";

import {FileTokenStorage} from "./file-token-storage";

import * as os from "os";
import * as path from "path";
import {Credentials} from "../credentials";
import {Logger} from "../../utils/logger";
import {inject, injectable} from "inversify";
import {TYPES} from "../../utils/constants";
import {CredentialsStore} from "../credentialsstore";

@injectable()
export class LinuxFileApi implements CredentialsStore {
    private fileTokenStorage: FileTokenStorage;
    public static readonly SERVICE_PREFIX = "teamcity_vscode:";
    private defaultFilename: string = "secrets.json";
    private defaultFolder: string = ".secrets";

    constructor(@inject(TYPES.FileTokenStorage) fileTokenStorage: FileTokenStorage) {
        const folder = this.defaultFolder;
        const filename = this.defaultFilename;
        this.fileTokenStorage = fileTokenStorage;
        this.fileTokenStorage.setFilename(path.join(path.join(os.homedir(), folder, filename)));
    }

    public async getCredentials(): Promise<Credentials> {
        let credentials: Credentials;
        const entries = await this.loadTeamCityCredentials();

        if (entries.length > 0) {
            credentials = this.createCredentials(entries[0]);
        }

        if (entries.length > 1) {
            Logger.logWarning("[LinuxFileApi::getCredentials] there are more then one suitable credentials for the user! " +
                "The first will be taken.");
        }
        return credentials;
    }

    public async setCredentials(credentials: Credentials): Promise<void> {
        const existingEntries = await this.loadCredentialsExceptTeamCity();

        const newEntry = {
            username: credentials.user,
            password: credentials.password,
            url: credentials.serverURL,
            service: LinuxFileApi.SERVICE_PREFIX
        };

        await this.fileTokenStorage.addEntries([newEntry], existingEntries);
    }

    public async removeCredentials(): Promise<void> {
        const existingEntries = await this.loadCredentialsExceptTeamCity();

        await this.fileTokenStorage.removeEntries(existingEntries);
    }

    private createCredentials(credentials: any): Credentials {
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

    getCredentialsSilently(): Credentials {
        throw new Error("Method not supported.");
    }
}
