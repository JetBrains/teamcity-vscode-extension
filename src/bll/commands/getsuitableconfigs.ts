import {Logger} from "../utils/logger";
import {MessageConstants} from "../utils/messageconstants";
import {CheckInInfo} from "../entities/checkininfo";
import {RemoteBuildServer} from "../../dal/remotebuildserver";
import {XmlParser} from "../utils/xmlparser";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {Output} from "../../view/output";
import {Project} from "../entities/project";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../view/dataproviders/interfaces/ibuildprovider";
import {GitProvider} from "../../dal/gitprovider";
import {Context} from "../../view/Context";

@injectable()
export class GetSuitableConfigs implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly resourceProvider: IResourceProvider;
    private readonly buildProvider: IBuildProvider;
    private readonly remoteBuildServer: RemoteBuildServer;
    private readonly xmlParser: XmlParser;
    private readonly output: Output;

    public constructor(@inject(TYPES.CvsProviderProxy) cvsProvider: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) resourceProvider: IResourceProvider,
                       @inject(TYPES.BuildProvider) buildProvider: IBuildProvider,
                       @inject(TYPES.RemoteBuildServer) remoteBuildServer: RemoteBuildServer,
                       @inject(TYPES.XmlParser) xmlParser: XmlParser,
                       @inject(TYPES.Output) output: Output,
                       @inject(TYPES.Context) private readonly context: Context) {
        this.cvsProvider = cvsProvider;
        this.resourceProvider = resourceProvider;
        this.buildProvider = buildProvider;
        this.remoteBuildServer = remoteBuildServer;
        this.xmlParser = xmlParser;
        this.output = output;
    }

    public async exec(args?: any[]): Promise<void> {
        Logger.logInfo("GetSuitableConfigs: starts");
        const checkInArray: CheckInInfo[] = await this.getCheckInArray();
        const projects: Project[] = await this.getProjectsWithSuitableBuilds(checkInArray);
        this.buildProvider.setContent(projects);
        const showPreTestedCommit: boolean = this.shouldShowPreTestedCommit(checkInArray);
        this.context.showPreTestedCommitButton(showPreTestedCommit);
        this.output.appendLine(MessageConstants.PLEASE_SPECIFY_BUILDS);
        this.output.show();
        Logger.logInfo("GetSuitableConfigs: finished");
    }

    private async getCheckInArray(): Promise<CheckInInfo[]> {
        const selectedResources: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!selectedResources || selectedResources.length === 0) {
            throw new Error(MessageConstants.NO_CHANGED_FILES_CHOSEN);
        } else {
            return selectedResources;
        }
    }

    private async getProjectsWithSuitableBuilds(checkInArray: CheckInInfo[]): Promise<Project[]> {
        const tcFormattedFilePaths: string[] = await this.cvsProvider.getFormattedFileNames(checkInArray);
        const shortBuildConfigNames: string[] =
            await this.remoteBuildServer.getSuitableConfigurations(tcFormattedFilePaths);
        if (!shortBuildConfigNames || shortBuildConfigNames.length === 0) {
            Logger.logError(`[GetSuitableConfig]: ${MessageConstants.SUITABLE_BUILDS_NOT_FOUND}`);
            return Promise.reject(MessageConstants.SUITABLE_BUILDS_NOT_FOUND);
        }
        const projectsWithRelatedBuildsXmls: string[] =
            await this.remoteBuildServer.getRelatedBuilds(shortBuildConfigNames);
        return this.xmlParser.parseProjectsWithRelatedBuilds(projectsWithRelatedBuildsXmls);
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
}
