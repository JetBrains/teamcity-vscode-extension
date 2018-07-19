import {Logger} from "../../bll/utils/logger";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GetLocalBranchNameCommand} from "./GetLocalBranchNameCommand";

export class GetRemoteNameCommand {

    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private cpProxy: CpProxy,
                private getLocalBranchNameCommand: GetLocalBranchNameCommand) {
        //
    }

    public async execute(): Promise<string> {
        const END_SPACES_REGEXP: RegExp = /\s*$/;
        let getRemoteResult: any;

        const command: string = await this.getCommand();
        Logger.logDebug(`GetRemoteNameCommand#exec: command is ${command}`);
        getRemoteResult = await this.cpProxy.execAsync(command);
        if (!getRemoteResult || !getRemoteResult.stdout) {
            Logger.logWarning(`GetRemoteNameCommand#exec: result is empty`);
            throw new Error("Can't determine a remote name.");
        }

        return getRemoteResult.stdout.toString().replace(END_SPACES_REGEXP, "");
    }

    private async getCommand(): Promise<string> {
        const builder: string[] = [];
        builder.push(`"${this.gitPath}"`);
        builder.push(`-C "${this.workspaceRootPath}"`);
        builder.push("config");
        builder.push(`branch.${await this.getLocalBranchNameCommand.execute()}.remote`);
        return builder.join(" ");
    }
}
