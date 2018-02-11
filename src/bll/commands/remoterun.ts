"use strict";

import {Logger} from "../utils/logger";
import {BuildConfigItem} from "../entities/buildconfigitem";
import {CheckInInfo} from "../entities/checkininfo";
import {MessageManager} from "../../view/messagemanager";
import {MessageConstants} from "../utils/messageconstants";
import {PatchSender} from "../remoterun/patchsender";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {ProviderManager} from "../../view/providermanager";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {IBuildProvider} from "../../view/dataproviders/interfaces/ibuildprovider";

@injectable()
export class RemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly patchSender: PatchSender;
    private readonly buildProvider: IBuildProvider;
    private readonly resourceProvider: IResourceProvider;
    private readonly providerManager: ProviderManager;

    public constructor(@inject(TYPES.CvsProviderProxy) cvsProvider: CvsProviderProxy,
                       @inject(TYPES.BuildProvider) buildProvider: IBuildProvider,
                       @inject(TYPES.ResourceProvider) resourceProvider: IResourceProvider,
                       @inject(TYPES.ProviderManager) providerManager: ProviderManager,
                       @inject(TYPES.PatchSender) patchSender: PatchSender) {
        this.cvsProvider = cvsProvider;
        this.buildProvider = buildProvider;
        this.resourceProvider = resourceProvider;
        this.providerManager = providerManager;
        this.patchSender = patchSender;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("RemoteRun#exec: starts");
        const includedBuildConfigs: BuildConfigItem[] = this.buildProvider.getSelectedContent();
        const checkInArray: CheckInInfo[] = this.resourceProvider.getSelectedContent();
        if (!includedBuildConfigs || includedBuildConfigs.length === 0) {
            MessageManager.showErrorMessage(MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            Logger.logWarning("RemoteRun#exec: " + MessageConstants.NO_CONFIGS_RUN_REMOTERUN);
            return;
        }
        this.resourceProvider.resetTreeContent();
        this.buildProvider.resetTreeContent();
        this.providerManager.showEmptyDataProvider();
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
