"use strict";

import * as xmlrpc from "xmlrpc";
import {Logger} from "../bll/utils/logger";
import {Constants} from "../bll/utils/constants";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {RemoteBuildServer} from "./remotebuildserver";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {injectable} from "inversify";

@injectable()
export class RemoteBuildServerImpl implements RemoteBuildServer {

    private _client;

    init(credentialsStore: CredentialsStore) {
        this._client = xmlrpc.createClient({url: credentialsStore.getCredential().serverURL + "/RPC2", cookies: true});
        this._client.setCookie(Constants.XMLRPC_SESSIONID_KEY, credentialsStore.getCredential().sessionId);
    }

    /**
     * @param userId - user internal id
     * @return SummeryDataProxy object
     */
    getGZippedSummary(userId: string): Promise<Uint8Array[]> {
        return new Promise<Uint8Array[]>((resolve, reject) => {
            this._client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [userId], (err, data) => {
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
    getTotalNumberOfEvents(serializedSubscription: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._client.methodCall("UserSummaryRemoteManager2.getTotalNumberOfEvents", [serializedSubscription], (err, data) => {
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
    getSuitableConfigurations(filesFromPatch: string[]): Promise<string[]> {
        const changedFiles: string[] = [];
        //Sometimes filePaths contain incorrect backslash symbols.
        filesFromPatch.forEach((row) => {
            changedFiles.push(row.replace(/\\/g, "/"));
        });
        Logger.logDebug(`XmlRpcBuildConfigResolver#requestConfigIds: changedFiles: ${changedFiles.join(";")}`);
        return new Promise<string[]>((resolve, reject) => {
            this._client.methodCall("VersionControlServer.getSuitableConfigurations", [changedFiles], (err, configurationId) => {
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
    getRelatedBuilds(suitableConfigurations: string[]): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this._client.methodCall("RemoteBuildServer2.getRelatedProjects", [suitableConfigurations], (err, buildXmlArray) => {
                if (err || !buildXmlArray) {
                    Logger.logError("RemoteBuildServer2.getRelatedProjects failed with error: " + VsCodeUtils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(buildXmlArray);
            });
        });
    }
}
