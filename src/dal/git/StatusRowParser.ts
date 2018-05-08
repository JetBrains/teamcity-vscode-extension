import {AddedCvsResource} from "../../bll/entities/cvsresources/addedcvsresource";
import {ReplacedCvsResource} from "../../bll/entities/cvsresources/replacedcvsresource";
import {ModifiedCvsResource} from "../../bll/entities/cvsresources/modifiedcvsresource";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import * as path from "path";
import {GitParser} from "../../bll/cvsutils/git-parser";
import {DeletedCvsResource} from "../../bll/entities/cvsresources/deletedcvsresource";
import {Logger} from "../../bll/utils/logger";

export class StatusRowParser {

    public tryParseRows(workspaceRootPath: string, statusRows: string[]) {
        const result: CvsResource[] = [];

        statusRows.forEach((statusRow) => {
            try {
                const resource = StatusRowParser.parseCvsResource(workspaceRootPath, statusRow);
                result.push(resource);
            } catch (err) {
                Logger.logDebug("salkdwasfoasdofoasd");
            }
        });

        return result;
    }

    private static parseCvsResource(workspaceRootPath: string,
                                    statusRow: string): CvsResource {
        const {relativePath, status} = GitParser.parseStatusRow(statusRow);

        switch (status) {
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
                const {relativePath: replacedPath, prevRelativePath} = GitParser.parseReplacedPath(relativePath);
                const fileAbsPath: string = path.join(workspaceRootPath, replacedPath);
                const prevFileAbsPath: string = path.join(workspaceRootPath, prevRelativePath);
                return new ReplacedCvsResource(fileAbsPath, replacedPath, prevFileAbsPath);
            }
            case "C": {
                const {relativePath: replacedPath} = GitParser.parseReplacedPath(relativePath);
                const fileAbsPath: string = path.join(workspaceRootPath, replacedPath);
                return new AddedCvsResource(fileAbsPath, replacedPath);
            }
            default: {
                throw new Error(`Resource status for status row ${statusRow} is ` +
                    `'${status}' and not recognised`);
            }
        }
    }
}
