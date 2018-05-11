import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GitStatusCommand} from "./GitStatusCommand";
import {inject, injectable} from "inversify";
import {TYPES} from "../../bll/utils/constants";
import {GitStatusRowsParser} from "./GitStatusRowsParser";

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
}
