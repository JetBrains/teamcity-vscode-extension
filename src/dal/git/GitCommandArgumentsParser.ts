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
        const porcelainStatusGitRegExp: RegExp = /^([MAD\s])([MAD\s])\s(.*)$/;
        const parsedPorcelain: string[] = porcelainStatusGitRegExp.exec(statusRow);
        if (!parsedPorcelain || parsedPorcelain.length !== 4) {
            throw new Error(`Incorrect number of parsed arguments in the status row "${statusRow}"`);
        }
        return {
            indexStatus: parsedPorcelain[1].trim() !== "" ? parsedPorcelain[1].trim() : undefined,
            workingTreeStatus: parsedPorcelain[2].trim() !== "" ? parsedPorcelain[2].trim() : undefined,
            relativePath: parsedPorcelain[3].trim()
        };
    }

    private parseReplacedStatus(statusRow: string): GitParsedStatusRow {
        const porcelainStatusGitRegExp: RegExp = /^([RC\s])([MAD\s])\s(.*)->(.*)$/;
        const parsedPorcelain: string[] = porcelainStatusGitRegExp.exec(statusRow);
        if (!parsedPorcelain || parsedPorcelain.length !== 5) {
            throw new Error(`Incorrect number of parsed arguments in the replaced path "${statusRow}"`);
        }
        return {
            indexStatus: parsedPorcelain[1].trim() !== "" ? parsedPorcelain[1].trim() : undefined,
            workingTreeStatus: parsedPorcelain[2].trim() !== "" ? parsedPorcelain[2].trim() : undefined,
            relativePath: parsedPorcelain[4].trim(),
            prevRelativePath: parsedPorcelain[3].trim()
        };
    }

    public static parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }
}
