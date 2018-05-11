import {GitParsedStatusRow} from "../../bll/cvsutils/git-status-row";
import {injectable} from "inversify";

@injectable()
export class GitCommandArgumentsParser {

    public parseStatusRow(statusRow: string): GitParsedStatusRow {
        if (!statusRow) {
            throw new Error("GitCommandArgumentsParserStatus#parseStatusRow: row should not be empty.");
        }

        if (statusRow.indexOf("->") === -1) {
            return this.parseModifiedStatus(statusRow);
        } else {
            return this.parseReplacedStatus(statusRow);
        }
    }

    private parseModifiedStatus(statusRow: string): GitParsedStatusRow {
        const porcelainStatusGitRegExp: RegExp = /^([MAD]).\s(.*)$/;
        const parsedPorcelain: string[] = porcelainStatusGitRegExp.exec(statusRow);
        if (!parsedPorcelain || parsedPorcelain.length !== 3) {
            throw new Error(`Incorrect number of parsed arguments in the status row "${statusRow}"`);
        }
        return {
            status: parsedPorcelain[1].trim(),
            relativePath: parsedPorcelain[2].trim()
        };
    }

    private parseReplacedStatus(statusRow: string): GitParsedStatusRow {
        const porcelainStatusGitRegExp: RegExp = /^([RC]).\s(.*)->(.*)$/;
        const parsedPorcelain: string[] = porcelainStatusGitRegExp.exec(statusRow);
        if (!parsedPorcelain || parsedPorcelain.length !== 4) {
            throw new Error(`Incorrect number of parsed arguments in the replaced path "${statusRow}"`);
        }
        return {
            status: parsedPorcelain[1].trim(),
            relativePath: parsedPorcelain[3].trim(),
            prevRelativePath: parsedPorcelain[2].trim()
        };
    }

    public static parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }
}
