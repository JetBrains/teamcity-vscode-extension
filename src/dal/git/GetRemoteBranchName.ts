import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {Logger} from "../../bll/utils/logger";

export class GetRemoteBranchName {

    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private readonly cpProxy: CpProxy) {
        //
    }

    public async execute(): Promise<string> {
        const theCommand: string = this.getCommand();

        const commandResult: { stdout: string } = await this.cpProxy.execAsync(theCommand);
        if (!commandResult || !commandResult.stdout || commandResult.stdout.length === 0) {
            Logger.logError(`GetRemoteBranchName: remote branch wasn't determined`);
            throw new Error("GitRemote branch wasn't determined");
        }

        const remoteBranch: string = commandResult.stdout.replace(/'/g, "").trim();
        Logger.logDebug(`GetRemoteBranchName: remote branch is ${remoteBranch}`);
        return remoteBranch;
    }

    private getCommand(): string {
        return `"${this.gitPath}" -C "${this.workspaceRootPath}" rev-parse --abbrev-ref --symbolic-full-name @{u}`;
    }
}
