import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {Logger} from "../../bll/utils/logger";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GitStatusRowsParser} from "./GitStatusRowsParser";

export class GitStatusCommand {

    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private cpProxy: CpProxy,
                private readonly statusRowParser: GitStatusRowsParser,
                private readonly isPorcelain: boolean = true) {
        //
    }

    public async execute(): Promise<CvsResource[]> {
        const END_SPACES_REGEXP: RegExp = /\s*$/;
        let porcelainStatusResult: any;

        porcelainStatusResult = await this.cpProxy.execAsync(this.getCommand());
        if (!porcelainStatusResult || !porcelainStatusResult.stdout) {
            Logger.logWarning(`GitStatusCommand#exec: git status command result is empty`);
            return [];
        }

        const statusRows = porcelainStatusResult.stdout
            .toString()
            .replace(END_SPACES_REGEXP, "")
            .split("\n");

        return this.statusRowParser.tryParseRows(this.workspaceRootPath, statusRows);

    }

    private getCommand(): string {
        const builder: string[] = [];
        builder.push(`"${this.gitPath}"`);
        builder.push(`-C "${this.workspaceRootPath}"`);
        builder.push("status");
        builder.push(`${this.isPorcelain ? "--porcelain" : ""}`);
        return builder.join(" ");
    }
}
