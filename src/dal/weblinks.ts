"use strict";

import * as request from "request";
import {BuildConfigItem} from "../bll/entities/buildconfigitem";
import {Credentials} from "../bll/credentialsstore/credentials";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {TYPES} from "../bll/utils/constants";
import {FsProxy} from "../bll/moduleproxies/fs-proxy";

@injectable()
export class WebLinks {

    private credentialsStore: CredentialsStore;
    private fsProxy: FsProxy;

    constructor (@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                 @inject(TYPES.FsProxy) fsProxy: FsProxy) {
        this.credentialsStore = credentialsStore;
        this.fsProxy = fsProxy;
    }

    /**
     * @param changeListId - id of change list to trigger
     * @param buildConfig - build configs, which should be triggered
     */
    async buildQueue(changeListId: string, buildConfig: BuildConfigItem): Promise<string> {
        if (!buildConfig) {
            return undefined;
        }
        const credentials: Credentials = await this.credentialsStore.getCredentials();
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
        const credentials: Credentials = await this.credentialsStore.getCredentials();
        const patchDestinationUrl: string = `${credentials.serverURL}/uploadChanges.html?userId=${credentials.userId}&description=${message}&commitType=0`;
        const options = {
            url: patchDestinationUrl,
            headers: {
                "Authorization": WebLinks.generateAuthorizationHeader(credentials)
            }
        };

        return new Promise<string>((resolve, reject) => {
            this.fsProxy.createReadStream(patchAbsPath).pipe(request.post(options, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            }));
        });
    }

    private static generateAuthorizationHeader(credentials : Credentials) : string {
        const crePair = credentials.user + ":" + credentials.password;
        const encoded = new Buffer(crePair).toString("base64");
        return "Basic " + encoded;
      }

    async getBuildInfo(buildId: string | number): Promise<string> {
        if (buildId === undefined || buildId === -1 || buildId === "-1") {
            return undefined;
        }
        const credentials: Credentials = await this.credentialsStore.getCredentials();
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
