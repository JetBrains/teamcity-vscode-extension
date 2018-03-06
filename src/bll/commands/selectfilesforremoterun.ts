import {Logger} from "../utils/logger";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {IResourceProvider} from "../../view/dataproviders/interfaces/iresourceprovider";

@injectable()
export class SelectFilesForRemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly resourceProvider: IResourceProvider;

    public constructor(@inject(TYPES.CvsProviderProxy) providerProxy: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) resourceProvider: IResourceProvider) {
        this.cvsProvider = providerProxy;
        this.resourceProvider = resourceProvider;
    }

    public async exec(args?: any[]): Promise<void> {
        Logger.logInfo("SelectFilesForRemoteRun#exec: start");
        const checkInInfo: CheckInInfo[] = await this.cvsProvider.getRequiredCheckInInfo();
        this.resourceProvider.setContent(checkInInfo);
    }
}
