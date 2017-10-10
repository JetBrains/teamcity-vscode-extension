"use strict";

import {Logger} from "../utils/logger";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {CheckInInfo} from "../remoterun/checkininfo";

export class SelectFilesForRemoteRun implements Command {

    private readonly cvsProvider;
    public constructor(cvsProvider: CvsSupportProvider) {
        this.cvsProvider = cvsProvider;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const checkInInfo: CheckInInfo = await this.cvsProvider.getRequiredCheckInInfo();
        DataProviderManager.setExplorerContentAndRefresh(checkInInfo);
    }
}
