"use strict";

import {Logger} from "../utils/logger";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CvsSupportProvider} from "../../dal/cvsprovider";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";

export class SelectFilesForRemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    public constructor(cvsProvider: CvsProviderProxy) {
        this.cvsProvider = cvsProvider;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const checkInInfo: CheckInInfo[] = await this.cvsProvider.getRequiredCheckInInfo();
        //TODO: process correct logic here
        DataProviderManager.setExplorerContentAndRefresh(checkInInfo);
    }
}
