import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {Logger} from "../../bll/utils/logger";

export class GetFirstMonthRev {
    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private readonly cpProxy: CpProxy) {
        //
    }

    public async execute(): Promise<string> {
        const command: string = this.getCommand();
        const result: { stdout: string } = await this.cpProxy.execAsync(command);
        if (!result || !result.stdout) {
            Logger.logWarning(`GitSupportProvider#firstRevHash: first month revision wasn't determined.`);
            return "";
        }
        const firstRevHash: string = result.stdout.split("\n")[0];
        Logger.logDebug(`GitSupportProvider#firstRevHash: first month revision is ${firstRevHash}`);
        return firstRevHash;
    }

    private getCommand(): string {
        const date: Date = new Date();

        return `"${this.gitPath}" -C "${this.workspaceRootPath}" rev-list --reverse ` +
            `--since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
    }
}
