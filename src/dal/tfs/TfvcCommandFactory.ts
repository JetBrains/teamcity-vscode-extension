import {BriefDiffCommand} from "./BriefDiffCommand";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {BriefDiffRowsParser} from "./BriefDiffRowsParser";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import {TfvcCommitCommand} from "./TfvcCommitCommand";
import {CheckInInfo} from "../../bll/entities/checkininfo";

export class TfvcCommandFactory {
    public constructor(private readonly workspaceRootPath: string,
                       private readonly tfPath: string,
                       private readonly tfsInfo: ITfsWorkFoldInfo,
                       private readonly cpProxy: CpProxy) {
        //
    }

    public getBriefDiffCommand(): BriefDiffCommand {
        const parser: BriefDiffRowsParser = new BriefDiffRowsParser(this.tfPath, this.tfsInfo, this.cpProxy);
        return new BriefDiffCommand(this.workspaceRootPath, this.tfPath, this.cpProxy, parser);
    }

    public getTfvcCommitCommand(checkInInfo: CheckInInfo): TfvcCommitCommand {
        return new TfvcCommitCommand(this.tfPath, this.cpProxy, checkInInfo);
    }
}
