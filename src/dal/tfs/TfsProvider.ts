import {Logger} from "../../bll/utils/logger";
import {CvsSupportProvider} from "../cvsprovider";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {CheckInInfo} from "../../bll/entities/checkininfo";
import {TfvcCommandFactory} from "./TfvcCommandFactory";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";

export class TfvcProvider implements CvsSupportProvider {

    private readonly tfvcCommandFactory: TfvcCommandFactory;
    public constructor(private readonly workspaceRootPath: string,
                       private readonly tfPath: string,
                       private readonly tfsInfo: ITfsWorkFoldInfo,
                       private readonly cpProxy: CpProxy) {
        this.tfvcCommandFactory = new TfvcCommandFactory(workspaceRootPath, tfPath, tfsInfo, cpProxy);
    }

    public async getRequiredCheckInInfo(): Promise<CheckInInfo> {
        Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: should get checkIn info`);
        const cvsLocalResources: CvsResource[] = await this.getLocalResources();
        return new CheckInInfo(cvsLocalResources, this);
    }

    private async getLocalResources(): Promise<CvsResource[]> {
        return this.tfvcCommandFactory.getBriefDiffCommand().execute();
    }

    public async commit(checkInInfo: CheckInInfo): Promise<void> {
        return this.tfvcCommandFactory.getTfvcCommitCommand(checkInInfo).execute();
    }

    public getRootPath(): string {
        return this.workspaceRootPath;
    }
}
