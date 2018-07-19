import {Logger} from "../../bll/utils/logger";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";

export class GetLocalBranchNameCommand {

    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private cpProxy: CpProxy) {
        //
    }

    public async execute(): Promise<string> {
        const END_SPACES_REGEXP: RegExp = /\s*$/;
        let getLocalBranchResult: any;

        getLocalBranchResult = await this.cpProxy.execAsync(this.getCommand());
        if (!getLocalBranchResult || !getLocalBranchResult.stdout) {
            Logger.logWarning(`GetLocalBranchNameCommand#exec: result is empty`);
            throw new Error("Can't determine a local branch name.");
        }

        return getLocalBranchResult.stdout.toString().replace(END_SPACES_REGEXP, "");
    }

    private getCommand(): string {
        const builder: string[] = [];
        builder.push(`"${this.gitPath}"`);
        builder.push(`-C "${this.workspaceRootPath}"`);
        builder.push("rev-parse");
        builder.push("--abbrev-ref");
        builder.push("HEAD");
        return builder.join(" ");
    }
}
