"use strict";

import {commands} from "vscode";
import {Logger} from "../utils/logger";
import {DataProviderManager} from "../../view/dataprovidermanager";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {injectable, inject} from "inversify";
import {TYPES} from "../utils/constants";

@injectable()
export class SelectFilesForRemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;

    public constructor(@inject(TYPES.ProviderProxy) providerProxy: CvsProviderProxy) {
        this.cvsProvider = providerProxy;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("CommandHolderImpl#selectFilesForRemoteRun: starts");
        const checkInInfo: CheckInInfo[] = await this.cvsProvider.getRequiredCheckInInfo();
        commands.executeCommand("setContext", "teamcity-select-files-for-remote-run", true);
        DataProviderManager.setExplorerContentAndRefresh(checkInInfo);
    }
}
