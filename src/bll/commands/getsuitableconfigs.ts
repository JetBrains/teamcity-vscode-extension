"use strict";

import {Logger} from "../utils/logger";
import {CvsLocalResource} from "../entities/cvslocalresource";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {ProjectItem} from "../entities/projectitem";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {CheckInInfo} from "../remoterun/checkininfo";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {XmlParser} from "../utils/xmlparser";
import {VsCodeUtils} from "../utils/vscodeutils";

export class GetSuitableConfigs implements Command {

    //Require to be logged in!!!!
    private readonly lastRequestedCheckInInfo: CheckInInfo;
    private readonly cvsProvider: CvsSupportProvider;
    private readonly remoteBuildServer: RemoteBuildServer;
    private readonly xmlParser: XmlParser;

    public constructor(lastRequestedCheckInInfo: CheckInInfo, cvsProvider: CvsSupportProvider, remoteBuildServer: RemoteBuildServer, xmlParser: XmlParser) {
        this.lastRequestedCheckInInfo = lastRequestedCheckInInfo;
        this.cvsProvider = cvsProvider;
        this.remoteBuildServer = remoteBuildServer;
        this.xmlParser = xmlParser;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("GetSuitableConfigs#exec: starts");
        try {
            const checkInInfo: CheckInInfo = await this.getCheckInInfo();
            const projects: ProjectItem[] = await this.getProjectsWithSuitableBuilds(checkInInfo);
            DataProviderManager.setExplorerContentAndRefresh(projects);
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
            return Promise.reject(VsCodeUtils.formatErrorMessage(err));
        }
        MessageManager.showInfoMessage(MessageConstants.PLEASE_SPECIFY_BUILDS);
        Logger.logInfo("GetSuitableConfigs#exec: finished");
    }

    private async getCheckInInfo(): Promise<CheckInInfo> {
        let checkInInfo: CheckInInfo = this.getCheckInInfoFromRequestedResources();
        if (!checkInInfo) {
            checkInInfo = await this.cvsProvider.getRequiredCheckInInfo();
        }
        return checkInInfo;
    }

    private getCheckInInfoFromRequestedResources(): CheckInInfo | undefined {
        const checkInInfo: CheckInInfo = this.lastRequestedCheckInInfo;
        const selectedResources: CvsLocalResource[] = DataProviderManager.getInclResources();
        if (checkInInfo && selectedResources && selectedResources.length > 0) {
            checkInInfo.cvsLocalResources = selectedResources;
        }
        return checkInInfo;
    }

    private async getProjectsWithSuitableBuilds(checkInInfo: CheckInInfo): Promise<ProjectItem[]> {
        const tcFormattedFilePaths: string[] = await this.cvsProvider.getFormattedFileNames(checkInInfo);
        const shortBuildConfigNames: string[] = await this.remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        const buildXmlArray: string[] = await this.remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        return this.xmlParser.parseBuilds(buildXmlArray);
    }
}
