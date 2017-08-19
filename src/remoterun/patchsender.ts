"use strict";

import * as fs from "fs";
import * as xml2js from "xml2js";
import * as request from "request";
import { Logger } from "../utils/logger";
import { VsCodeUtils } from "../utils/vscodeutils";
import { PatchManager } from "../utils/patchmanager";
import { PatchSender } from "../remoterun/patchsender";
import { BuildConfigItem } from "../entities/leaveitems";
import { Credentials } from "../credentialsstore/credentials";
import { XmlRpcProvider } from "../entities/xmlrpcprovider";
import { CvsSupportProvider } from "../remoterun/cvsprovider";
import { Constants, ChangeListStatus } from "../utils/constants";
import { CheckinInfo, RestHeader, QueuedBuild } from "../utils/interfaces";
const temp = require("temp").track();

export interface PatchSender {
    /**
     * @returns true in case of success, otherwise false.
     */
    /* async */ remoteRun(credentials : Credentials, configs : BuildConfigItem[], cvsProvider : CvsSupportProvider) : Promise<boolean>;
}

export class CustomPatchSender extends XmlRpcProvider implements PatchSender {
    private readonly CHECK_FREQUENCY_MS : number = 10000;
    /**
     * @returns true in case of success, otherwise false.
     */
    public async remoteRun(credentials: Credentials, configs: BuildConfigItem[], cvsProvider: CvsSupportProvider): Promise<boolean> {
        //We might not have userId at the moment
        if (!credentials.userId) {
            await this.authenticateIfRequired(credentials);
        }
        const patchAbsPath : string = await PatchManager.preparePatch(cvsProvider);
        const checkInInfo : CheckinInfo = await cvsProvider.getRequiredCheckinInfo();
        const patchDestinationUrl : string = `${credentials.serverURL}/uploadChanges.html?userId=${credentials.userId}&description="${checkInInfo.message}"&commitType=0`;
        try {
            const prom : Promise<string> = new Promise((resolve, reject) => {
                fs.createReadStream(patchAbsPath).pipe(request.post(patchDestinationUrl, (err, httpResponse, body) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                }).auth(credentials.user, credentials.pass, false));
            });
            const changeListId = await prom;
            //We should not remove patchFile because it will be deleted as file inside a temp folder
            const queuedBuilds : QueuedBuild[] = await this.triggerChangeList(changeListId, configs, credentials);
            const changeListStatus : ChangeListStatus = await this.getChangeListStatus(credentials, queuedBuilds);
            if (changeListStatus === ChangeListStatus.CHECKED) {
                VsCodeUtils.showInfoMessage(`Personal build for change #${changeListId} has "CHECKED" status.`);
                return true;
            } else {
                VsCodeUtils.showWarningMessage(`Personal build for change #${changeListId} has "FAILED" status.`);
                return false;
            }
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
            return false;
        }
    }

    /**
     * @param changeListId - id of change list to trigger
     * @param buildConfigs - all build configs, which should be triggered
     * @param credentials - user credentials
     */
    public async triggerChangeList( changeListId : string,
                                    buildConfigs : BuildConfigItem[],
                                    credentials : Credentials) : Promise<QueuedBuild[]> {
        if (!buildConfigs) {
            return [];
        }
        const queuedBuilds : QueuedBuild[] = [];
        for (let i = 0; i < buildConfigs.length; i++) {
            const build : BuildConfigItem = buildConfigs[i];
            const url : string = `${credentials.serverURL}/app/rest/buildQueue`;
            const data = `
                <build personal="true">
                    <triggeringOptions cleanSources="false" rebuildAllDependencies="false" queueAtTop="false"/>
                    <buildType id="${build.externalId}"/>
                    <lastChanges>
                        <change id="${changeListId}" personal="true"/>
                    </lastChanges>
                </build>`;
            const additionalArgs : string[] = undefined;
            const additionalHeaders : RestHeader[] = [];
            additionalHeaders.push({
                header: "Content-Type",
                value: "application/xml"
            });
            const queuedBuildInfoXml : string = await VsCodeUtils.makeRequest(Constants.POST_METHOD, url, credentials, data, additionalArgs, additionalHeaders);
            xml2js.parseString(queuedBuildInfoXml, (err, queuedBuildInfo) => {
                queuedBuilds.push(queuedBuildInfo.build.$);
            });
        }
        return queuedBuilds;
    }

    private async getChangeListStatus(credentials: Credentials, queuedBuilds: QueuedBuild[]): Promise<ChangeListStatus> {
        if (!queuedBuilds) {
            return ChangeListStatus.CHECKED;
        }
        const buildStatuses : string[] = [];
        let i : number = 0;
        while (i < queuedBuilds.length) {
            const build : QueuedBuild = queuedBuilds[i];
            const url = `${credentials.serverURL}/app/rest/buildQueue/${build.id}`;
            const buildInfoXml : string = await VsCodeUtils.makeRequest(Constants.GET_METHOD, url, credentials);
            const prom : Promise<string> = new Promise((resolve, reject) => {
                xml2js.parseString(buildInfoXml, (err, buildInfo) => {
                    if (err) {
                        reject(`CustomPatchSender#getChangeListStatus: Can't parse buildInfoXml ${VsCodeUtils.formatErrorMessage(err)}`);
                    }
                    if (!buildInfo
                        || !buildInfo.build
                        || !buildInfo.build.$
                        || !buildInfo.build.$.state
                        || !buildInfo.build.$.status
                        || buildInfo.build.$.state !== "finished") {
                        resolve(undefined);
                    }
                    resolve(buildInfo.build.$.status);
                });
            });
            const buildStatus : string = await prom;
            if (!buildStatus) {
                await VsCodeUtils.sleep(this.CHECK_FREQUENCY_MS);
            } else {
                buildStatuses.push(buildStatus);
                i++;
            }
        }

        for (let i : number = 0; i < buildStatuses.length; i++) {
            const status : string = buildStatuses[i];
            if (status !== "SUCCESS") {
                return ChangeListStatus.FAILED;
            }
        }
        return ChangeListStatus.CHECKED;
    }
}
