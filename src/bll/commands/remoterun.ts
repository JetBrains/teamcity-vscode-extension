import {Logger} from "../utils/logger";
import {CheckInInfo} from "../entities/checkininfo";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {ChangeListStatus, TYPES} from "../utils/constants";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../view/dataproviders/interfaces/ibuildprovider";
import {BuildConfig} from "../entities/buildconfig";
import {IProviderManager} from "../../view/iprovidermanager";
import {CustomPatchSender} from "../remoterun/patchsender";
import {window} from "vscode";
import {PatchManager} from "../utils/patchmanager";
import {QueuedBuild} from "../utils/queuedbuild";

@injectable()
export class RemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly patchSender: CustomPatchSender;
    private readonly buildProvider: IBuildProvider;
    private readonly resourceProvider: IResourceProvider;
    private readonly providerManager: IProviderManager;
    private readonly patchManager: PatchManager;

    public constructor(@inject(TYPES.CvsProviderProxy) cvsProvider: CvsProviderProxy,
                       @inject(TYPES.BuildProvider) buildProvider: IBuildProvider,
                       @inject(TYPES.ResourceProvider) resourceProvider: IResourceProvider,
                       @inject(TYPES.ProviderManager) providerManager: IProviderManager,
                       @inject(TYPES.PatchSender) patchSender: CustomPatchSender,
                       @inject(TYPES.PatchManager) patchManager: PatchManager) {
        this.cvsProvider = cvsProvider;
        this.buildProvider = buildProvider;
        this.resourceProvider = resourceProvider;
        this.providerManager = providerManager;
        this.patchSender = patchSender;
        this.patchManager = patchManager;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("RemoteRun#exec: starts");
        const includedBuildConfigs: BuildConfig[] = this.buildProvider.getSelectedContent();
        const checkInArray: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!includedBuildConfigs || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("RemoteRun#exec: " + MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            return;
        }
        this.resourceProvider.resetTreeContent();
        this.buildProvider.resetTreeContent();
        this.providerManager.showEmptyDataProvider();

        const patchAbsPath: string = await this.patchManager.preparePatch(checkInArray);
        const commitMessage: string = await RemoteRun.requestForCommitMessageIfRequired(checkInArray);
        this.fillCommitMessage(checkInArray, commitMessage);

        const queuedBuilds: QueuedBuild[] = await this.patchSender.sendPatch(includedBuildConfigs, patchAbsPath, commitMessage);
        const changeListStatus: ChangeListStatus = await this.patchSender.waitForChangeFinish(queuedBuilds);

        if (changeListStatus === ChangeListStatus.CHECKED) {
            Logger.logInfo("RemoteRun#exec: remote run is ok");
            return this.cvsProvider.requestForPostCommit(checkInArray);
        } else {
            Logger.logWarning("RemoteRun#exec: something went wrong during remote run");
            return Promise.reject("Something went wrong during remote run");
        }
    }

    private static async requestForCommitMessageIfRequired(checkInArray: CheckInInfo[]): Promise<string> {
        let commitMessage: string;
        if (checkInArray.length > 0) {
            commitMessage = await window.showInputBox({
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
