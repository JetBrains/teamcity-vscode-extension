import {GitParsedStatusRow} from "./git-status-row";
import {GitReplacedPath} from "./git-replaced-path";

export class GitParser {

    public static parseStatusRow(statusRow: string): GitParsedStatusRow {
        const porcelainStatusGitRegExp: RegExp = /^([MADRC]).\s(.*)$/;
        const parsedPorcelain: string[] = porcelainStatusGitRegExp.exec(statusRow);
        if (!parsedPorcelain || parsedPorcelain.length !== 3) {
            throw new Error(`Incorrect number of parsed arguments in the status row ${statusRow}`);
        }
        return {
            status: parsedPorcelain[1].trim(),
            relativePath: parsedPorcelain[2].trim()
        };
    }

    public static parseReplacedPath(unparsedPath: string): GitReplacedPath {
        const replacedPathRegExp: RegExp = /^(.*)->(.*)$/;
        const parsedReplacedPath: string[] = replacedPathRegExp.exec(unparsedPath);
        if (!parsedReplacedPath || parsedReplacedPath.length !== 3) {
            throw new Error(`Incorrect number of parsed arguments in the replaced path ${unparsedPath}`);
        }
        return {
            relativePath: parsedReplacedPath[2].trim(),
            prevRelativePath: parsedReplacedPath[1].trim()
        };
    }

    public static parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }
}
