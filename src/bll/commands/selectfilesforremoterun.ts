"use strict";

import {Logger} from "../utils/logger";
import {DataProviderManager} from "../../view/dataprovidermanager";
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
        DataProviderManager.setExplorerContentAndRefresh(checkInInfo);
    }
}
