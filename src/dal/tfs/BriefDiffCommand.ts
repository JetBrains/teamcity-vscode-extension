import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {Logger} from "../../bll/utils/logger";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {BriefDiffRowsParser} from "./BriefDiffRowsParser";

export class BriefDiffCommand {
    public constructor(private readonly workspaceRootPath: string,
                       private readonly tfPath: string,
                       private readonly cpProxy: CpProxy,
                       private readonly briefDiffRowsParser: BriefDiffRowsParser) {
        //
    }

    public async execute(): Promise<CvsResource[]> {
        const result: {stdout: string} = await this.cpProxy.execAsync(this.getCommand());
        if (!result || !result.stdout) {
            Logger.logWarning(`BriefDiffCommand#exec: result is empty`);
            throw new Error("Can't get list of changed files.");
        }
        const statusRows: string = result.stdout.trim();
        return this.briefDiffRowsParser.tryParseRows(statusRows);
    }

    private getCommand(): string {
        return `"${this.tfPath}" diff /noprompt /format:brief /recursive "${this.workspaceRootPath}"`;
    }
}
