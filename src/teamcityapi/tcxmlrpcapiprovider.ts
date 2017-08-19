"use strict";

import {TCApiProvider} from "../interfaces/TCApiProvider";
import {Credentials} from "../credentialsstore/credentials";
import {Logger} from "../utils/logger";
import {ProjectItem} from "../entities/projectitem";
import {XmlRpcBuildConfigResolver} from "../remoterun/XmlRpcBuildConfigResolver";
import {BuildConfigResolver} from "../interfaces/BuildConfigResolver";
import {NotificationProvider} from "../notifications/notificationprovider";
import {SummaryDataProxy} from "../entities/summarydataproxy";

export class TCXmlRpcApiProvider implements TCApiProvider {

    public async checkCredential(credentials: Credentials): Promise<boolean> {
        Logger.logError(`TCXmlRpcApiProvider#checkCredential: this method is unsupported by xmlRpc provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getSuitableBuildConfigs(tcFormattedFilePaths: string[], credentials: Credentials): Promise<ProjectItem[]> {
        const configResolver: BuildConfigResolver = new XmlRpcBuildConfigResolver(credentials.serverURL);
        return configResolver.getSuitableBuildConfigs(tcFormattedFilePaths, credentials);
    }

    /**
     * @return - number of event for existing subscriptions.
     * Subscription is created at ModificationCounterSubscription.fromTeamServerSummaryData during NotificationProvider#init
     */
    public async getTotalNumberOfEvents(credentials: Credentials): Promise<number> {
        const notificationProvider: NotificationProvider = await NotificationProvider.getInstance(credentials);
        return notificationProvider.getTotalNumberOfEvents();
    }

    public async getSummary(credentials: Credentials): Promise<SummaryDataProxy> {
        const notificationProvider: NotificationProvider = await NotificationProvider.getInstance(credentials);
        return notificationProvider.getSummeryData(credentials);
    }
}
