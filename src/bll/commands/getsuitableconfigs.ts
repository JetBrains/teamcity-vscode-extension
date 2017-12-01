"use strict";

import {commands} from "vscode";
import {Logger} from "../utils/logger";
import {ProjectItem} from "../entities/projectitem";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {CheckInInfo} from "../entities/checkininfo";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {XmlParser} from "../utils/xmlparser";
import {VsCodeUtils} from "../utils/vscodeutils";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {injectable, inject} from "inversify";
import {TYPES} from "../utils/constants";
import {ResourceProvider} from "../../view/dataproviders/resourceprovider";
import {BuildProvider} from "../../view/dataproviders/buildprovider";

@injectable()
export class GetSuitableConfigs implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly resourceProvider: ResourceProvider;
    private readonly buildProvider: BuildProvider;
    private readonly remoteBuildServer: RemoteBuildServer;
    private readonly xmlParser: XmlParser;

    public constructor(@inject(TYPES.CvsProviderProxy) cvsProvider: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) resourceProvider: ResourceProvider,
                       @inject(TYPES.BuildProvider) buildProvider: BuildProvider,
                       @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                       @inject(TYPES.XmlParser) xmlParser: XmlParser) {
        this.cvsProvider = cvsProvider;
        this.resourceProvider = resourceProvider;
        this.buildProvider = buildProvider;
        this.remoteBuildServer = remoteBuildServer;
        this.xmlParser = xmlParser;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("GetSuitableConfigs#exec: starts");
        try {
            const checkInArray: CheckInInfo[] = await this.getCheckInArray();
            const projects: ProjectItem[] = await this.getProjectsWithSuitableBuilds(checkInArray);
            this.buildProvider.setContent(projects);
        } catch (err) {
            Logger.logError(VsCodeUtils.formatErrorMessage(err));
            return Promise.reject(VsCodeUtils.formatErrorMessage(err));
        }
        MessageManager.showInfoMessage(MessageConstants.PLEASE_SPECIFY_BUILDS);
        Logger.logInfo("GetSuitableConfigs#exec: finished");
    }

    private async getCheckInArray(): Promise<CheckInInfo[]> {
        const selectedResources: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!selectedResources || selectedResources.length === 0) {
            throw new Error("Please, choose at least one changed resource");
        } else {
            return selectedResources;
        }
    }

    private async getProjectsWithSuitableBuilds(checkInArray: CheckInInfo[]): Promise<ProjectItem[]> {
        const tcFormattedFilePaths: string[] = await this.cvsProvider.getFormattedFileNames(checkInArray);
        const shortBuildConfigNames: string[] = await this.remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        const buildXmlArray: string[] = await this.remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        return this.xmlParser.parseBuilds(buildXmlArray);
    }
}
