import {Logger} from "../utils/logger";
import {CheckInInfo} from "../entities/checkininfo";
import {MessageConstants} from "../utils/messageconstants";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {ChangeListStatus, TYPES} from "../utils/constants";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../view/dataproviders/interfaces/ibuildprovider";
import {BuildConfig} from "../entities/buildconfig";
import {IProviderManager} from "../../view/iprovidermanager";
import {CustomPatchSender} from "../remoterun/patchsender";
import {PatchManager} from "../utils/patchmanager";
import {QueuedBuild} from "../utils/queuedbuild";
import {WindowProxy} from "../moduleproxies/window-proxy";

@injectable()
export class RemoteRun implements Command {

    public constructor(@inject(TYPES.CvsProviderProxy) private readonly cvsProvider: CvsProviderProxy,
                       @inject(TYPES.BuildProvider) private readonly buildProvider: IBuildProvider,
                       @inject(TYPES.ResourceProvider) private readonly resourceProvider: IResourceProvider,
                       @inject(TYPES.ProviderManager) private readonly providerManager: IProviderManager,
                       @inject(TYPES.PatchSender) private readonly patchSender: CustomPatchSender,
                       @inject(TYPES.PatchManager) private readonly patchManager: PatchManager,
                       @inject(TYPES.WindowProxy) private readonly windowProxy: WindowProxy) {
        //
    }

    public async exec(args?: any[]): Promise<void> {
        if (!args || args.length !== 1) {
            Logger.logError("RemoteRun#exec: incorrect arguments");
        }
        const isPreTestedCommit: boolean = !!args[0];

        Logger.logInfo("RemoteRun#exec: Personal Build started");
        const buildConfigs: BuildConfig[] = this.buildProvider.getSelectedContent();
        const checkInArray: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!buildConfigs || buildConfigs.length === 0) {
            return Promise.reject(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
        }
        this.resourceProvider.resetTreeContent();
        this.buildProvider.resetTreeContent();
        this.providerManager.showChangesProvider();

        const patchAbsPath: string = await this.patchManager.preparePatch(checkInArray);
        const message: string = await this.requestForCommitMessageIfRequired(checkInArray);
        this.fillCommitMessage(checkInArray, message);

        const queuedBuilds: QueuedBuild[] = await this.patchSender.sendPatch(buildConfigs, patchAbsPath, message);
        const changeListStatus: ChangeListStatus = await this.patchSender.waitForChangeFinish(queuedBuilds);

        if (changeListStatus === ChangeListStatus.CHECKED ) {
            Logger.logInfo("RemoteRun#exec: Personal Build is successful");
            if (isPreTestedCommit) {
                return this.cvsProvider.requestForPostCommit(checkInArray);
            }
        } else {
            Logger.logWarning("RemoteRun#exec: Personal Build failed");
            return Promise.reject("Personal Build failed");
        }
    }

    private async requestForCommitMessageIfRequired(checkInArray: CheckInInfo[]): Promise<string> {
        let commitMessage: string;
        if (checkInArray.length > 0) {
            commitMessage = await this.windowProxy.showInputBox({
                prompt: MessageConstants.PROVIDE_MESSAGE_FOR_REMOTE_RUN
            });
        }
        return commitMessage || "";
    }

    private fillCommitMessage(checkInArray: CheckInInfo[], commitMessage: string) {
        checkInArray.forEach((checkInInfo) => {
            checkInInfo.message = commitMessage;
        });
    }
}
