import {Logger} from "../../bll/utils/logger";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GetRemoteNameCommand} from "./GetRemoteNameCommand";

export class GetRepoBranchNameCommand {

    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private cpProxy: CpProxy,
                private getRemoteNameCommand: GetRemoteNameCommand) {
        //
    }

    public async execute(): Promise<string> {
        const remoteName: string = await this.getRemoteNameCommand.execute();
        const END_SPACES_REGEXP: RegExp = /\s*$/;
        let getRemoteAndBranchResult: any;

        const command: string = await this.getCommand();
        Logger.logDebug(`GetRepoBranchNameCommand#exec: command is ${command}`);
        getRemoteAndBranchResult = await this.cpProxy.execAsync(command);
        if (!getRemoteAndBranchResult || !getRemoteAndBranchResult.stdout) {
            Logger.logWarning(`GetRepoBranchNameCommand#exec: result is empty`);
            throw new Error("Can't determine a remote name.");
        }

        const remoteAndBranch: string = getRemoteAndBranchResult.stdout.toString().replace(END_SPACES_REGEXP, "");
        return remoteAndBranch.substring(remoteName.length + 1);
    }

    private async getCommand(): Promise<string> {
        const builder: string[] = [];
        builder.push(`"${this.gitPath}"`);
        builder.push(`-C "${this.workspaceRootPath}"`);
        builder.push("rev-parse");
        builder.push("--abbrev-ref");
        builder.push("--symbolic-full-name");
        builder.push("@{u}");
        return builder.join(" ");
    }
}
