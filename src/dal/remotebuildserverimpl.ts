"use strict";

import * as xmlrpc from "xmlrpc";
import {Logger} from "../bll/utils/logger";
import {Constants} from "../bll/utils/constants";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {RemoteBuildServer} from "./remotebuildserver";
import {Credentials} from "../bll/credentialsstore/credentials";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {injectable, inject} from "inversify";
import {TYPES} from "../bll/utils/constants";

@injectable()
export class RemoteBuildServerImpl implements RemoteBuildServer {

    private credentialsStore: CredentialsStore;

    constructor (@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore) {
        this.credentialsStore = credentialsStore;
    }

    private async createAndInitClient(): Promise<any> {
        const credentials: Credentials = await this.credentialsStore.getCredentials();
        if (credentials) {
            const client = xmlrpc.createClient({url: credentials.serverURL + "/RPC2", cookies: true});
            client.setCookie(Constants.XMLRPC_SESSIONID_KEY, credentials.sessionId);
            return Promise.resolve(client);
        } else {
            throw new Error("User is logged out");
        }
    }

    private async getUserId(): Promise<any> {
        const credentials: Credentials = await this.credentialsStore.getCredentials();
        if (credentials) {
            return credentials.userId;
        } else {
            throw new Error("User is logged out");
        }
    }

    public async getGZippedSummary(): Promise<Uint8Array[]> {
        const client: any = await this.createAndInitClient();
        const userId: string = await this.getUserId();
        return new Promise<Uint8Array[]>((resolve, reject) => {
            client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [userId], (err, data) => {
                /* tslint:disable:no-null-keyword */
                if (err || !data) {
                    Logger.logError("UserSummaryRemoteManager2.getGZippedSummary: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    /**
     * @return - number of event for existing subscriptions.
     */
    public async getTotalNumberOfEvents(serializedSubscription: string): Promise<number> {
        const client: any = await this.createAndInitClient();
        return new Promise<number>((resolve, reject) => {
            client.methodCall("UserSummaryRemoteManager2.getTotalNumberOfEvents", [serializedSubscription], (err, data) => {
                if (err || !data) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: return an error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    /**
     * @param filesFromPatch - Changed file paths in particular format. The information is required to create request for suitableBuildConfigIds.
     * @return - array of all suitable Build Config Ids.
     */
    public async getSuitableConfigurations(filesFromPatch: string[]): Promise<string[]> {
        const client: any = await this.createAndInitClient();
        const changedFiles: string[] = [];
        //Sometimes filePaths contain incorrect backslash symbols.
        filesFromPatch.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        Logger.logDebug(`XmlRpcBuildConfigResolver#requestConfigIds: changedFiles: ${changedFiles.join(";")}`);
        return new Promise<string[]>((resolve, reject) => {
            client.methodCall("VersionControlServer.getSuitableConfigurations", [changedFiles], (err, configurationId) => {
                if (err || !configurationId) {
                    Logger.logError("VersionControlServer.getSuitableConfigurations failed with error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(configurationId);
            });
        });
    }

    /**
     * @param suitableConfigurations - array of build configurations. Extension requests all related projects to collect full information
     * about build configurations (including projectNames and buildConfigurationName). The information is required to create label for BuildConfig.
     * @return - array of buildXml
     */
    public async getRelatedBuilds(suitableConfigurations: string[]): Promise<string[]> {
        const client: any = await this.createAndInitClient();
        return new Promise<string[]>((resolve, reject) => {
            client.methodCall("RemoteBuildServer2.getRelatedProjects", [suitableConfigurations], (err, buildXmlArray) => {
                if (err || !buildXmlArray) {
                    Logger.logError("RemoteBuildServer2.getRelatedProjects failed with error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(buildXmlArray);
            });
        });
    }
}
