"use strict";

import {Logger} from "../utils/logger";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CheckInInfo} from "../entities/checkininfo";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {PatchSender} from "../remoterun/patchsender";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";

export class RemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly patchSender: PatchSender;

    public constructor(cvsProvider: CvsProviderProxy, patchSender: PatchSender) {
        this.cvsProvider = cvsProvider;
        this.patchSender = patchSender;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("RemoteRun#exec: starts");
        const includedBuildConfigs: BuildConfigItem[] = DataProviderManager.getIncludedBuildConfigs();
        const checkInArray: CheckInInfo[] = DataProviderManager.getStoredCheckInArray();
        if (!includedBuildConfigs || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("RemoteRun#exec: " + MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            return;
        }
        DataProviderManager.resetExplorerContentAndRefresh();
        const remoteRunResult: boolean = await this.patchSender.remoteRun(includedBuildConfigs, checkInArray);
        if (remoteRunResult) {
            Logger.logInfo("RemoteRun#exec: remote run is ok");
            return this.cvsProvider.requestForPostCommit(checkInArray);
        } else {
            Logger.logWarning("RemoteRun#exec: something went wrong during remote run");
            return Promise.reject("Something went wrong during remote run");
        }
    }
}
