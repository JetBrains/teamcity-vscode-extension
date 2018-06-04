import {Logger} from "../utils/logger";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";
import {WindowProxy} from "../moduleproxies/window-proxy";

@injectable()
export class SelectFilesForRemoteRun implements Command {

    public constructor(@inject(TYPES.CvsProviderProxy) private readonly cvsProvider: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) private readonly resourceProvider: IResourceProvider,
                       @inject(TYPES.WindowProxy) private readonly windowsProxy: WindowProxy) {
        //
    }

    public async exec(args?: any[]): Promise<void> {
        Logger.logInfo("SelectFilesForRemoteRun#exec: start");
        const checkInArrayPromise: Promise<CheckInInfo[]> = this.cvsProvider.getRequiredCheckInInfo();
        this.windowsProxy.showWithProgress("Collecting changes...", checkInArrayPromise);

        const checkInInfo: CheckInInfo[] = await checkInArrayPromise;
        this.resourceProvider.setContent(checkInInfo);
    }
}
