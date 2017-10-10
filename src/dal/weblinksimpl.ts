"use strict";

import * as fs from "fs";
import * as request from "request";
import {WebLinks} from "./weblinks";
import {BuildConfigItem} from "../bll/entities/buildconfigitem";
import {Credentials} from "../bll/credentialsstore/credentials";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {injectable, inject} from "inversify";
import {TYPES} from "../bll/utils/constants";

@injectable()
export class WebLinksImpl implements WebLinks {

    private credentialsStore: CredentialsStore;

    constructor (@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore) {
        this.credentialsStore = credentialsStore;
    }

    /**
     * @param changeListId - id of change list to trigger
     * @param buildConfig - build configs, which should be triggered
     */
    async buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string> {
        if (!buildConfig) {
            return undefined;
        }
        const credentials: Credentials = await this.credentialsStore.tryGetCredentials();
        const url: string = `${credentials.serverURL}/app/rest/buildQueue`;
        const data = `
            <build personal="true">
                <triggeringOptions cleanSources="false" rebuildAllDependencies="false" queueAtTop="false"/>
                <buildType id="${buildConfig.externalId}"/>
                <lastChanges>
                    <change id="${changeListId}" personal="true"/>
                </lastChanges>
            </build>`;
        return new Promise<string>((resolve, reject) => {
            request.post(
                {
                    uri: url
                    , headers: {
                    "Content-Type": "application/xml"
                }, body: data
                },
                function (err, httpResponse, body) {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                }).auth(credentials.user, credentials.password, false);
        });
    }

    async uploadChanges(patchAbsPath: string, message: string): Promise<string> {
        const credentials: Credentials = await this.credentialsStore.tryGetCredentials();
        const patchDestinationUrl: string = `${credentials.serverURL}/uploadChanges.html?userId=${credentials.userId}&description=${message}&commitType=0`;
        return new Promise<string>((resolve, reject) => {
            fs.createReadStream(patchAbsPath).pipe(request.post(patchDestinationUrl, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            }).auth(credentials.user, credentials.password, false));
        });
    }

    async getBuildInfo(buildId: string | number): Promise<string> {
        if (buildId === undefined || buildId === -1 || buildId === "-1") {
            return undefined;
        }
        const credentials: Credentials = await this.credentialsStore.tryGetCredentials();
        const url = `${credentials.serverURL}/app/rest/buildQueue/${buildId}`;
        return new Promise<string>((resolve, reject) => {
            request.get(url, function (err, response, body) {
                if (err) {
                    reject(err);
                }
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(response.statusMessage);
                }
            }).auth(credentials.user, credentials.password, false);
        });
    }
}
