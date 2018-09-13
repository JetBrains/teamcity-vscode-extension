import {BriefDiffCommand} from "./BriefDiffCommand";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {BriefDiffRowsParser} from "./BriefDiffRowsParser";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import {TfvcCommitCommand} from "./TfvcCommitCommand";
import {CheckInInfo} from "../../bll/entities/checkininfo";
import {GetPrevResourceName} from "./GetPrevResourceName";

export class TfvcCommandFactory {
    public constructor(private readonly workspaceRootPath: string,
                       private readonly tfPath: string,
                       private readonly tfsInfo: ITfsWorkFoldInfo,
                       private readonly cpProxy: CpProxy) {
        //
    }

    public getBriefDiffCommand(): BriefDiffCommand {
        return new BriefDiffCommand(this.workspaceRootPath, this.tfPath, this.cpProxy, this.getBriefDiffRowsParser());
    }

    private getBriefDiffRowsParser(): BriefDiffRowsParser {
        return new BriefDiffRowsParser(this.tfPath, this.tfsInfo, this.getPrevResourceNameCommand());
    }

    private getPrevResourceNameCommand(): GetPrevResourceName {
        return new GetPrevResourceName(this.tfPath, this.tfsInfo, this.cpProxy);
    }

    public getTfvcCommitCommand(checkInInfo: CheckInInfo): TfvcCommitCommand {
        return new TfvcCommitCommand(this.tfPath, this.cpProxy, checkInInfo);
    }

}
