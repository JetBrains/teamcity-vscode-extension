import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GetRemoteBranchName} from "./GetRemoteBranchName";
import {Logger} from "../../bll/utils/logger";

export class GetLastCompatibleMergeBaseRev {
    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private readonly cpProxy: CpProxy,
                private readonly getRemoteBranchName: GetRemoteBranchName) {
        //
    }

    public async execute(): Promise<string> {
        const remoteBranch: string = await this.getRemoteBranchName.execute();
        const theCommand: string = this.getCommand(remoteBranch);
        const result: { stdout: string } = await this.cpProxy.execAsync(theCommand);
        if (!result || !result.stdout || result.stdout.length === 0) {
            Logger.logError(`GetLastCompatibleMergeBaseRevision: revision of last commit wasn't determined`);
            throw new Error("Revision of last commit wasn't determined.");
        }

        const lastRevHash = result.stdout.trim();
        Logger.logDebug(`GetLastCompatibleMergeBaseRevision: last merge-based revision is ${lastRevHash}`);
        return lastRevHash;
    }

    private getCommand(remoteBranch: string) {
        return `"${this.gitPath}" -C "${this.workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
    }
}
