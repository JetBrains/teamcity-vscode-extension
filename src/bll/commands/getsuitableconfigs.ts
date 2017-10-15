"use strict";

import {Logger} from "../utils/logger";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {ProjectItem} from "../entities/projectitem";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {CheckInInfo} from "../entities/checkininfo";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {XmlParser} from "../utils/xmlparser";
import {VsCodeUtils} from "../utils/vscodeutils";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";

export class GetSuitableConfigs implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly remoteBuildServer: RemoteBuildServer;
    private readonly xmlParser: XmlParser;

    public constructor(cvsProvider: CvsProviderProxy, remoteBuildServer: RemoteBuildServer, xmlParser: XmlParser) {
        this.cvsProvider = cvsProvider;
        this.remoteBuildServer = remoteBuildServer;
        this.xmlParser = xmlParser;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("GetSuitableConfigs#exec: starts");
        try {
            const checkInArray: CheckInInfo[] = await this.getCheckInArray();
            if (!checkInArray || checkInArray.length === 0) {
                return;
            }
            const projects: ProjectItem[] = await this.getProjectsWithSuitableBuilds(checkInArray);
            DataProviderManager.setExplorerContentAndRefresh(projects);
            DataProviderManager.storeCheckInArray(checkInArray);
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
            return Promise.reject(VsCodeUtils.formatErrorMessage(err));
        }
        MessageManager.showInfoMessage(MessageConstants.PLEASE_SPECIFY_BUILDS);
        Logger.logInfo("GetSuitableConfigs#exec: finished");
    }

    private async getCheckInArray(): Promise<CheckInInfo[]> {
        let checkInArray: CheckInInfo[] = DataProviderManager.getCheckInArraysWithIncludedResources();
        if (!checkInArray || checkInArray.length === 0) {
            checkInArray = await this.cvsProvider.getRequiredCheckInInfo();
        }
        return checkInArray;
    }

    private async getProjectsWithSuitableBuilds(checkInArray: CheckInInfo[]): Promise<ProjectItem[]> {
        const tcFormattedFilePaths: string[] = await this.cvsProvider.getFormattedFileNames(checkInArray);
        const shortBuildConfigNames: string[] = await this.remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        const buildXmlArray: string[] = await this.remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        return this.xmlParser.parseBuilds(buildXmlArray);
    }
}
