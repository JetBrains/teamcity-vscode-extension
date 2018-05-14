import {AddedCvsResource} from "../../bll/entities/cvsresources/addedcvsresource";
import {ReplacedCvsResource} from "../../bll/entities/cvsresources/replacedcvsresource";
import {ModifiedCvsResource} from "../../bll/entities/cvsresources/modifiedcvsresource";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import * as path from "path";
import {GitCommandArgumentsParser} from "./GitCommandArgumentsParser";
import {DeletedCvsResource} from "../../bll/entities/cvsresources/deletedcvsresource";
import {Logger} from "../../bll/utils/logger";
import {inject, injectable} from "inversify";
import {Utils} from "../../bll/utils/utils";
import {TYPES} from "../../bll/utils/constants";
import {Settings} from "../../bll/entities/settings";

@injectable()
export class GitStatusRowsParser {

    constructor(@inject(TYPES.Settings) private readonly settings: Settings) {
        //
    }

    public tryParseRows(workspaceRootPath: string, statusRows: string[]): CvsResource[] {
        const result: CvsResource[] = [];

        statusRows.forEach((statusRow) => {
            try {
                const resource = this.parseRow(workspaceRootPath, statusRow);
                result.push(resource);
            } catch (err) {
                Logger.logDebug("GitStatusRowsParser#tryParseRows: row was not parsed with error: " +
                    Utils.formatErrorMessage(err) );
            }
        });

        return result;
    }

    private parseRow(workspaceRootPath: string, statusRow: string): CvsResource {
        let isFromIndex = this.settings.shouldCollectGitChangesFromIndex();
        const {relativePath, indexStatus, workingTreeStatus, prevRelativePath} =
            GitCommandArgumentsParser.parseStatusRow(statusRow);
        isFromIndex = isFromIndex || (!isFromIndex && workingTreeStatus === undefined);
        switch (isFromIndex ? indexStatus : workingTreeStatus) {
            case "M": {
                const fileAbsPath: string = path.join(workspaceRootPath, relativePath);
                return new ModifiedCvsResource(fileAbsPath, relativePath);
            }
            case "A": {
                const fileAbsPath: string = path.join(workspaceRootPath, relativePath);
                return new AddedCvsResource(fileAbsPath, relativePath);
            }
            case "D": {
                const fileAbsPath: string = path.join(workspaceRootPath, relativePath);
                return new DeletedCvsResource(fileAbsPath, relativePath);
            }
            case "R": {
                const fileAbsPath: string = path.join(workspaceRootPath, relativePath);
                const prevFileAbsPath: string = path.join(workspaceRootPath, prevRelativePath);
                return new ReplacedCvsResource(fileAbsPath, relativePath, prevFileAbsPath);
            }
            case "C": {
                const fileAbsPath: string = path.join(workspaceRootPath, relativePath);
                return new AddedCvsResource(fileAbsPath, relativePath);
            }
            default: {
                throw new Error(`Resource status for status row ${statusRow} is ` +
                    `'${indexStatus}' and not recognised`);
            }
        }
    }
}
