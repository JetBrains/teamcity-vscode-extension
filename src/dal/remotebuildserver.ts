import {Logger} from "../bll/utils/logger";
import {Constants, TYPES} from "../bll/utils/constants";
import {Credentials} from "../bll/credentialsstore/credentials";
import {CredentialsStore} from "../bll/credentialsstore/credentialsstore";
import {inject, injectable} from "inversify";
import {RemoteLogin} from "./remotelogin";
import {Utils} from "../bll/utils/utils";
import {MessageConstants} from "../bll/utils/messageconstants";

@injectable()
export class RemoteBuildServer {

    private credentialsStore: CredentialsStore;
    private remoteLogin: RemoteLogin;

    constructor (@inject(TYPES.CredentialsStore) credentialsStore: CredentialsStore,
                 @inject(TYPES.RemoteLogin) remoteLogin: RemoteLogin) {
        this.credentialsStore = credentialsStore;
        this.remoteLogin = remoteLogin;
    }

    private async createAndInitClient(isSilent: boolean = false): Promise<any> {
        let credentials: Credentials;
        if (isSilent) {
            credentials = this.credentialsStore.getCredentialsSilently();
        } else {
            credentials = await this.credentialsStore.getCredentials();
        }
        if (credentials) {
            const client: any = this.remoteLogin.createClient(credentials.serverURL);
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

    public async getGZippedSummary(isSilent: boolean = false): Promise<Uint8Array> {
        const client: any = await this.createAndInitClient(isSilent);
        const userId: string = await this.getUserId();
        return new Promise<Uint8Array>((resolve, reject) => {
            client.methodCall("UserSummaryRemoteManager2.getGZippedSummary", [userId], (err, data: Uint8Array) => {
                /* tslint:disable:no-null-keyword */
                if (err) {
                    Logger.logError("UserSummaryRemoteManager2.getGZippedSummary: return an error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                } else if (!data) {
                    Logger.logError("UserSummaryRemoteManager2.getGZippedSummary: data is empty" + new Error().stack);
                    return reject("Received data object is unexpectedly empty");
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
                if (err) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: return an error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                } else if (!data) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: data is empty: " + new Error().stack );
                    return reject("Received data object is unexpectedly empty");
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
        Logger.logDebug(`RemoteBuildServer#requestConfigIds: changedFiles: ${changedFiles.join(";")}`);
        return new Promise<string[]>((resolve, reject) => {
            client.methodCall("VersionControlServer.getSuitableConfigurations", [changedFiles], (err, configurationId) => {
                if (err) {
                    err = err.code === ("ENOENT" || "ENOTFOUND") ? MessageConstants.URL_NOT_REACHABLE : err;
                    Logger.logError("VersionControlServer.getSuitableConfigurations failed with error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                } else if (!configurationId) {
                    Logger.logError("VersionControlServer.getSuitableConfigurations: configurationId is unexpectedly empty " + new Error().stack);
                    return reject("Configuration ids is unexpectedly empty");
                }

                Logger.logDebug(`[RemoteBuildServer#requestConfigIds: changedFiles] was found ${configurationId.length}\n` +
                    `Suitable configuration loaded ID's: ${configurationId.join(";")}`);
                resolve(configurationId);
            });
        });
    }

    public async getCurrentTimestamp(): Promise<number> {
        const client: any = await this.createAndInitClient();
        return new Promise<number>((resolve, reject) => {
            client.methodCall("IDEPluginNotificator.getCurrentTimestamp", [], (err, data) => {
                if (err || !data) {
                    Logger.logError("UserSummaryRemoteManager2.getTotalNumberOfEvents: return an error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    public async getBuildMessages(timestamp: number): Promise<string[]> {
        const client: any = await this.createAndInitClient();
        const userId: string = await this.getUserId();
        return new Promise<string[]>((resolve, reject) => {
            client.methodCall("IDEPluginNotificator.getBuildMessages", [userId, timestamp.toString()], (err, data) => {
                if (err) {
                    Logger.logError("IDEPluginNotificator.getBuildMessages: return an error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                }

                resolve(data);
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
                if (err) {
                    Logger.logError("RemoteBuildServer2.getRelatedProjects failed with error: " + Utils.formatErrorMessage(err));
                    return reject(err);
                } else if (!buildXmlArray) {
                    Logger.logError("RemoteBuildServer2.getRelatedBuilds: buildXmlArray is unexpectedly empty " + new Error().stack);
                    return reject("Build array is unexpectedly empty");
                }

                resolve(buildXmlArray);
            });
        });
    }
}
