import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GitStatusCommand} from "./GitStatusCommand";

export class GitCommandsFactory {
    public getStatusCommand(workspaceRootPath: string,
                            gitPath: string,
                            isPorcelain: boolean,
                            cpProxy?: CpProxy): GitStatusCommand {
        return new GitStatusCommand(workspaceRootPath, gitPath, isPorcelain, cpProxy);
    }
}
