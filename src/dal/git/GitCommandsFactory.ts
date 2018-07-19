import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GitStatusCommand} from "./GitStatusCommand";
import {inject, injectable} from "inversify";
import {TYPES} from "../../bll/utils/constants";
import {GitStatusRowsParser} from "./GitStatusRowsParser";
import {GetRepoBranchNameCommand} from "./GetRepoBranchNameCommand";
import {GetRemoteNameCommand} from "./GetRemoteNameCommand";
import {GetLocalBranchNameCommand} from "./GetLocalBranchNameCommand";

@injectable()
export class GitCommandsFactory {

    constructor(@inject(TYPES.CpProxy) private readonly cpProxy: CpProxy,
                @inject(TYPES.GitStatusRowsParser) private readonly gitStatusRowsParser: GitStatusRowsParser) {
        //
    }

    public getStatusCommand(workspaceRootPath: string,
                            gitPath: string,
                            isPorcelain: boolean): GitStatusCommand {
        return new GitStatusCommand(workspaceRootPath, gitPath, isPorcelain, this.cpProxy, this.gitStatusRowsParser);
    }

    public getRepoBranchNameCommand(workspaceRootPath: string, gitPath: string): GetRepoBranchNameCommand {
        const getRemoteNameCommand: GetRemoteNameCommand = this.getGetRemoteNameCommand(workspaceRootPath, gitPath);
        return new GetRepoBranchNameCommand(workspaceRootPath, gitPath, this.cpProxy, getRemoteNameCommand);
    }

    private getGetRemoteNameCommand(workspaceRootPath: string, gitPath: string): GetRemoteNameCommand {
        const getLocalBranchNameCommand: GetLocalBranchNameCommand =
            this.getLocalBranchNameCommand(workspaceRootPath, gitPath);
        return new GetRemoteNameCommand(workspaceRootPath, gitPath, this.cpProxy, getLocalBranchNameCommand);
    }

    public getLocalBranchNameCommand(workspaceRootPath: string, gitPath: string): GetLocalBranchNameCommand {
        return new GetLocalBranchNameCommand(workspaceRootPath, gitPath, this.cpProxy);
    }
}
