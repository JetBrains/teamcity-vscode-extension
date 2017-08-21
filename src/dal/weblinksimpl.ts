"use strict";

import * as fs from "fs";
import * as request from "request";
import {WebLinks} from "./weblinks";
import {QueuedBuild} from "../interfaces/queuedbuild";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {Credentials} from "../credentialsstore/credentials";
import {injectable} from "inversify";

@injectable()
export class WebLinksImpl implements WebLinks {

    private readonly _credentials: Credentials;

    constructor(credentials: Credentials) {
        this._credentials = credentials;
    }

    /**
     * @param changeListId - id of change list to trigger
     * @param buildConfig - build configs, which should be triggered
     */
    async buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string> {
        if (!buildConfig) {
            return undefined;
        }
        const url: string = `${this._credentials.serverURL}/app/rest/buildQueue`;
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
                }).auth(this._credentials.user, this._credentials.password, false);
        });
    }

    uploadChanges(patchAbsPath: string, message: string): Promise<string> {
        const patchDestinationUrl: string = `${this._credentials.serverURL}/uploadChanges.html?userId=${this._credentials.userId}&description="${message}"&commitType=0`;
        return new Promise<string>((resolve, reject) => {
            fs.createReadStream(patchAbsPath).pipe(request.post(patchDestinationUrl, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            }).auth(this._credentials.user, this._credentials.password, false));
        });
    }

    getBuildInfo(build: QueuedBuild): Promise<string> {
        const url = `${this._credentials.serverURL}/app/rest/buildQueue/${build.id}`;
        return new Promise((resolve, reject) => {
            request.get(url, function (err, response, body) {
                if (err) {
                    reject(err);
                }
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(response.statusMessage);
                }
            }).auth(this._credentials.user, this._credentials.password, false);
        });
    }
}
