"use strict";

import {Logger} from "../utils/logger";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CheckInInfo} from "../entities/checkininfo";
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
        //TODO: process correct logic here
        const checkInInfo: CheckInInfo = DataProviderManager.getStoredCheckInArray()[0];
        if (!includedBuildConfigs || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("RemoteRun#exec: " + MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            return;
        }
        DataProviderManager.resetExplorerContentAndRefresh();
        const remoteRunResult: boolean = await this.patchSender.remoteRun(includedBuildConfigs, this.cvsProvider);
        if (remoteRunResult) {
            Logger.logInfo("RemoteRun#exec: remote run is ok");
            return this.cvsProvider.requestForPostCommit(checkInInfo);
        } else {
            Logger.logWarning("RemoteRun#exec: something went wrong during remote run");
            return Promise.reject("Something went wrong during remote run");
        }
    }
}
