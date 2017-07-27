"use strict";
import { Credential } from "../credentialstore/credential";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Constants } from "../utils/constants";
import { Strings } from "../utils/strings";
import { ProjectItem } from "../remoterun/configexplorer";
import { BuildConfigResolver, XmlRpcBuildConfigResolver } from "./buildconfigresolver";
import { NotificationProvider } from "./notificationprovider";
import XHR = require("xmlhttprequest");

export interface TCApiProvider {
    /* async */ checkCredential( cred : Credential ) : Promise<boolean>;
    /* async */ getSuitableBuildConfigs( tcFormatedFilePaths : string[], cred : Credential ) : Promise<ProjectItem[]>;
    /* async */ getTotalNumberOfEvents( cred : Credential ) : Promise<number>;
}

export class TCRestApiProvider implements TCApiProvider {
    /**
     * @param method - type of request (GET, POST, ...)
     * @param url - url of request
     * @param cred - Credential for basic authorization
     * @return Promise with request.response in case of success, otherwise a reject with status of response and statusText.
     */
    private makeRequest(method, url, cred : Credential) {
        const XMLHttpRequest = XHR.XMLHttpRequest;
        return new Promise(function (resolve, reject) {
            const request : XHR.XMLHttpRequest = new XMLHttpRequest();
            request.open(method, url, true);
            request.setRequestHeader("Authorization", "Basic " + new Buffer(cred.user + ":" + cred.pass).toString("base64"));
            request.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
            reject({
                status: this.status,
                statusText: request.statusText
            });
            };
            request.send();
        });
    }

    /**
     * @param cred Credential of user
     * @return Promise<boolean>: true in case of success, false in case of fail.
     */
    public async checkCredential( cred : Credential ) : Promise<boolean> {
        const url = cred.serverURL + "/app/rest/";
        const p : Promise<boolean> = new Promise((resolve, reject) => {
            this.makeRequest("GET", url, cred)
            .then((response) => { resolve(true); })
            .catch((err) => {
                if (err.status === Constants.HTTP_STATUS_UNAUTHORIZED) {
                    VsCodeUtils.showErrorMessage(Strings.STATUS_CODE_401);
                } else {
                    VsCodeUtils.showErrorMessage(Strings.UNEXPECTED_EXCEPTION);
                }
                resolve(false);
            });
        });
        return p;
    }

    public async getSuitableBuildConfigs( tcFormatedFilePaths : string[], cred : Credential ) : Promise<ProjectItem[]> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        throw "UnsupportedMethodException.";
    }

    public async getTotalNumberOfEvents( cred : Credential ) : Promise<number> {
        //TODO: implement with RestBuildConfigResolver class. API from TeamCity required.
        throw "UnsupportedMethodException.";
    }
}

export class TCXmlRpcApiProvider implements TCApiProvider {

    public async checkCredential(cred : Credential) : Promise<boolean> {
        throw "UnsupportedMethodException.";
    }

    public async getSuitableBuildConfigs( tcFormatedFilePaths : string[], cred : Credential ) : Promise<ProjectItem[]> {
        const configResolver : BuildConfigResolver =  new XmlRpcBuildConfigResolver(cred.serverURL);
        return configResolver.getSuitableBuildConfigs(tcFormatedFilePaths, cred);
    }

    /**
     * @return - number of event for existing subscriptions.
     * Subs are created at ModificationCounterSubscription.fromTeamServerSummaryData during NotificationProvider#init
     */
    public async getTotalNumberOfEvents( cred : Credential ) : Promise<number> {
        const notificationProvider : NotificationProvider = await NotificationProvider.getInstance(cred);
        return notificationProvider.getTotalNumberOfEvents();
    }
}
