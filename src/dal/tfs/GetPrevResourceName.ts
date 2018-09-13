import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import * as path from "path";
import {Logger} from "../../bll/utils/logger";

export class GetPrevResourceName {
    private static readonly PARSE_HISTORY_REGEXP: RegExp = /(\$.*)$/;

    constructor(private readonly tfPath: string,
                private readonly tfsInfo: ITfsWorkFoldInfo,
                private readonly cpProxy: CpProxy) {
        //
    }

    public async execute(fileAbsPath: string): Promise<string | undefined> {
        const result: { stdout: string } = await this.cpProxy.execAsync(this.getCommand(fileAbsPath));
        if (!result || !result.stdout) {
            return undefined;
        }
        const historyRowsArray: string[] = result.stdout.trim().split("\n");
        const lastHistoryRow: string = historyRowsArray[historyRowsArray.length - 1];
        const parsedLastHistoryRow: string[] = GetPrevResourceName.PARSE_HISTORY_REGEXP.exec(lastHistoryRow);
        if (GetPrevResourceName.isInCorrectFormat(parsedLastHistoryRow)) {
            const prevRelativePath: string =
                parsedLastHistoryRow[1].replace(this.tfsInfo.projectRemotePath, "");
            return path.join(this.tfsInfo.projectLocalPath, prevRelativePath);
        }

        Logger.logWarning(`BriefDiffRowsParser: can't parse last history command row`);
        return undefined;
    }

    private getCommand(fileAbsPath: string): string {
        return `"${this.tfPath}" history /format:detailed /stopafter:1 ${fileAbsPath}`;
    }

    private static isInCorrectFormat(parsedLastHistoryRow: string[]): boolean {
        return parsedLastHistoryRow && parsedLastHistoryRow.length === 2;
    }
}
