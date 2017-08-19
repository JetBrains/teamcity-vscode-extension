"use strict";

import {TCApiProvider} from "../interfaces/TCApiProvider";
import {Credentials} from "../credentialsstore/credentials";
import {VsCodeUtils} from "../utils/vscodeutils";
import {Logger} from "../utils/logger";
import {MessageConstants} from "../utils/MessageConstants";
import {Constants} from "../utils/constants";
import {ProjectItem} from "../entities/projectitem";
import {SummaryDataProxy} from "../entities/summarydataproxy";

export class TCRestApiProvider implements TCApiProvider {

    /**
     * @param credentials Credential of user
     * @return Promise<boolean>: true in case of success, false in case of fail.
     */
    public async checkCredential(credentials: Credentials): Promise<boolean> {
        const url = credentials.serverURL + "/app/rest/";
        return new Promise<boolean>((resolve, reject) => {
            VsCodeUtils.makeRequest("GET", url, credentials)
                .then((response) => {
                    Logger.logDebug("TCRestApiProvider#checkCredential: good response from " + url);
                    resolve(true);
                })
                .catch((err) => {
                    if (err.status === Constants.HTTP_STATUS_UNAUTHORIZED) {
                        VsCodeUtils.showErrorMessage(MessageConstants.STATUS_CODE_401);
                    } else {
                        VsCodeUtils.showErrorMessage(MessageConstants.UNEXPECTED_EXCEPTION);
                    }
                    Logger.logError(`TCRestApiProvider#checkCredential: bad response from ${url}: ${VsCodeUtils.formatErrorMessage(err)}`);
                    resolve(false);
                });
        });
    }

    public async getSuitableBuildConfigs(tcFormattedFilePaths: string[], credentials: Credentials): Promise<ProjectItem[]> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getSuitableBuildConfigs: this method is unsupported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getTotalNumberOfEvents(credentials: Credentials): Promise<number> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getTotalNumberOfEvents: this method is unsupported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }

    public async getSummary(credentials: Credentials): Promise<SummaryDataProxy> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        Logger.logError(`TCRestApiProvider#getSummary: this method is unsupported by rest provider`);
        throw new Error("UnsupportedMethodException.");
    }
}
