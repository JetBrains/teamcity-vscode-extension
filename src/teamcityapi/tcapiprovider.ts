"use strict";

import { Logger } from "../utils/logger";
import { Strings } from "../utils/constants";
import { Constants } from "../utils/constants";
import { VsCodeUtils } from "../utils/vscodeutils";
import { ProjectItem } from "../entities/projectitem";
import { SummaryDataProxy } from "../entities/summarydata";
import { Credentials } from "../credentialsstore/credentials";
import { NotificationProvider } from "../notifications/notificationprovider";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "../remoterun/buildconfigresolver";

export interface TCApiProvider {
    /* async */ checkCredential( credentials : Credentials ) : Promise<boolean>;
    /* async */ getSuitableBuildConfigs( tcFormatedFilePaths : string[], credentials : Credentials ) : Promise<ProjectItem[]>;
    /* async */ getTotalNumberOfEvents( credentials : Credentials ) : Promise<number>;
    /* async */ getSummary( credentials : Credentials ) : Promise<SummaryDataProxy>;
}

export class TCRestApiProvider implements TCApiProvider {

    /**
     * @param credentials Credential of user
     * @return Promise<boolean>: true in case of success, false in case of fail.
     */
    public async checkCredential( credentials : Credentials ) : Promise<boolean> {
        const url = credentials.serverURL + "/app/rest/";
        return new Promise<boolean>((resolve, reject) => {
            VsCodeUtils.makeRequest("GET", url, credentials)
            .then((response) => {
                Logger.logDebug("TCRestApiProvider#checkCredential: good response from " + url);
                resolve(true);
            })
            .catch((err) => {
                if (err.status === Constants.HTTP_STATUS_UNAUTHORIZED) {
                    VsCodeUtils.showErrorMessage(Strings.STATUS_CODE_401);
                } else {
                    VsCodeUtils.showErrorMessage(Strings.UNEXPECTED_EXCEPTION);
                }
                Logger.logError(`TCRestApiProvider#checkCredential: bad response from ${url}: ${VsCodeUtils.formatErrorMessage(err)}`);
                resolve(false);
            });
        });
    }

    public async getSuitableBuildConfigs( tcFormatedFilePaths : string[], credentials : Credentials ) : Promise<ProjectItem[]> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getSuitableBuildConfigs: this method is unsopported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getTotalNumberOfEvents( credentials : Credentials ) : Promise<number> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getTotalNumberOfEvents: this method is unsopported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getSummary( credentials : Credentials ) : Promise<SummaryDataProxy> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getSummary: this method is unsopported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }
}

export class TCXmlRpcApiProvider implements TCApiProvider {

    public async checkCredential(credentials : Credentials) : Promise<boolean> {
        Logger.logError(`TCXmlRpcApiProvider#checkCredential: this method is unsopported by xmlrpc provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getSuitableBuildConfigs( tcFormatedFilePaths : string[], credentials : Credentials ) : Promise<ProjectItem[]> {
        const configResolver : BuildConfigResolver =  new XmlRpcBuildConfigResolver(credentials.serverURL);
        return configResolver.getSuitableBuildConfigs(tcFormatedFilePaths, credentials);
    }

    /**
     * @return - number of event for existing subscriptions.
     * Subscription is created at ModificationCounterSubscription.fromTeamServerSummaryData during NotificationProvider#init
     */
    public async getTotalNumberOfEvents( credentials : Credentials ) : Promise<number> {
        const notificationProvider : NotificationProvider = await NotificationProvider.getInstance(credentials);
        return notificationProvider.getTotalNumberOfEvents();
    }

    public async getSummary( credentials : Credentials ) : Promise<SummaryDataProxy> {
        const notificationProvider : NotificationProvider = await NotificationProvider.getInstance(credentials);
        return notificationProvider.getSummeryData(credentials);
    }
}
