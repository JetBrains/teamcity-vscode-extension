import {Logger} from "../utils/logger";
import {MessageConstants} from "../utils/messageconstants";
import {CheckInInfo} from "../entities/checkininfo";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {XmlParser} from "../utils/xmlparser";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {Constants, ParameterType, TYPES} from "../utils/constants";
import {Project} from "../entities/project";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../view/dataproviders/interfaces/ibuildprovider";
import {GitProvider} from "../../dal/gitprovider";
import {Context} from "../../view/Context";
import {WindowProxy} from "../moduleproxies/window-proxy";
import {BuildConfig} from "../entities/buildconfig";
import {MessageManager} from "../../view/messagemanager";
import opn = require("opn");
import {Utils} from "../utils/utils";
import {Parameter} from "../entities/Parameter";

@injectable()
export class GetSuitableConfigs implements Command {

    public constructor(@inject(TYPES.CvsProviderProxy) private readonly cvsProvider: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) private readonly resourceProvider: IResourceProvider,
                       @inject(TYPES.BuildProvider) private readonly buildProvider: IBuildProvider,
                       @inject(TYPES.RemoteBuildServer) private readonly remoteBuildServer: RemoteBuildServer,
                       @inject(TYPES.XmlParser) private readonly xmlParser: XmlParser,
                       @inject(TYPES.MessageManager) private readonly myMessageManager: MessageManager,
                       @inject(TYPES.Context) private readonly context: Context,
                       @inject(TYPES.WindowProxy) private readonly windowsProxy: WindowProxy) {
        //
    }

    public async exec(args?: any[]): Promise<void | boolean> {
        Logger.logInfo("GetSuitableConfigs: starts");
        const checkInArray: CheckInInfo[] = this.getCheckInArray();
        const projectPromise : Promise<Project[]> = this.getProjectsWithSuitableBuilds(checkInArray);
        this.windowsProxy.showWithProgress("Looking for suitable build configurations...", projectPromise);
        const projects: Project[] = await projectPromise;

        if (!projects && this.cvsProvider.hasGitProvider()) {
            const learnMore: {title: string} = {title: "Learn More..."};
            const textToShow: string = `${MessageConstants.SUITABLE_BUILDS_NOT_FOUND}. ` +
                `${MessageConstants.GIT_SUPPORT_LIMITATIONS_WARNING}`;
            const result = await this.myMessageManager.showErrorMessage(textToShow, learnMore);
            if (result && result.title === learnMore.title) {
                opn(Constants.GIT_SUPPORT_WIKI_PAGE);
            }
            return false;
        } else if (!projects) {
            throw new Error(MessageConstants.SUITABLE_BUILDS_NOT_FOUND);
        } else if (this.cvsProvider.hasGitProvider()) {
            const allSuitableBuilds: BuildConfig[] = Utils.flattenBuildConfigArray(projects);
            const gitBranchName: string = await this.cvsProvider.getGitBranch();
            const branchNameParameter: Parameter = new Parameter("teamcity.build.branch", gitBranchName);
            allSuitableBuilds.forEach((buildConfig: BuildConfig) => {
                buildConfig.addParameter(ParameterType.ConfigParameter, branchNameParameter);
            });
        }

        this.buildProvider.setContent(projects);
        const showPreTestedCommit: boolean = this.shouldShowPreTestedCommit(checkInArray);
        this.context.showPreTestedCommitButton(showPreTestedCommit);

        Logger.logInfo("GetSuitableConfigs: finished");
    }

    private getCheckInArray(): CheckInInfo[] {
        const selectedResources: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!selectedResources || selectedResources.length === 0) {
            throw new Error(MessageConstants.NO_CHANGED_FILES_CHOSEN);
        } else {
            return selectedResources;
        }
    }

    private async getProjectsWithSuitableBuilds(checkInArray: CheckInInfo[]): Promise<Project[] | undefined> {
        const tcFormattedFilePaths: string[] = await this.cvsProvider.getFormattedFileNames(checkInArray);
        const shortBuildConfigNames: string[] =
            await this.remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        if (!shortBuildConfigNames || shortBuildConfigNames.length === 0) {
            Logger.logError(`[GetSuitableConfig]: ${MessageConstants.SUITABLE_BUILDS_NOT_FOUND}`);
            return undefined;
        }
        const relatedProjectsXmls: string[] = await this.remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        const buildConfigFilter: (buildConfig: BuildConfig) => boolean = this.buildConfigFilterWrapper(shortBuildConfigNames);
        return this.xmlParser.parseProjectsWithRelatedBuilds(relatedProjectsXmls, buildConfigFilter);
    }

    private shouldShowPreTestedCommit(checkInArray: CheckInInfo[]): boolean {
        let shouldShow = false;
        checkInArray.forEach((checkInInfo) => {
            if (!(checkInInfo.cvsProvider instanceof GitProvider)) {
                shouldShow = true;
            }
        });

        return shouldShow;
    }

    private buildConfigFilterWrapper(shortBuildConfigNames: string[]) {
        return (buildConfig: BuildConfig) => {
            return shortBuildConfigNames.indexOf(buildConfig.id) !== -1;
        };
    }
}
