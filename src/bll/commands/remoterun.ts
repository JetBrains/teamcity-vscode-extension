"use strict";

import {Logger} from "../utils/logger";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CheckInInfo} from "../remoterun/checkininfo";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {PatchSender} from "../remoterun/patchsender";

export class RemoteRun implements Command {

    private readonly cvsProvider: CvsSupportProvider;
    private readonly patchSender: PatchSender;

    public constructor(cvsProvider: CvsSupportProvider, patchSender: PatchSender) {
        this.cvsProvider = cvsProvider;
        this.patchSender = patchSender;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("RemoteRun#exec: starts");
        const includedBuildConfigs: BuildConfigItem[] = DataProviderManager.getIncludedBuildConfigs();
        const checkInInfo: CheckInInfo = DataProviderManager.getCheckInInfoWithIncludedResources();
        if (!includedBuildConfigs === undefined || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("RemoteRun#exec: no selected build configs. Try to execute the 'GitRemote run' command");
            return;
        }

        DataProviderManager.resetExplorerContentAndRefresh();
        const remoteRunResult: boolean = await this.patchSender.remoteRun(includedBuildConfigs, this.cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("RemoteRun#exec: remote run is ok");
            try {
                await this.cvsProvider.requestForPostCommit(checkInInfo);
            } catch (err) {
                throw err;
            }
        } else {
            Logger.logWarning("RemoteRun#exec: something went wrong during remote run");
        }
        Logger.logInfo("RemoteRun#exec: end");
    }
}
