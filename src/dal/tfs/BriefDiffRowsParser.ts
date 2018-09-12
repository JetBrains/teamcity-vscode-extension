import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import * as path from "path";
import {DeletedCvsResource} from "../../bll/entities/cvsresources/deletedcvsresource";
import {AddedCvsResource} from "../../bll/entities/cvsresources/addedcvsresource";
import {ModifiedCvsResource} from "../../bll/entities/cvsresources/modifiedcvsresource";
import {ReplacedCvsResource} from "../../bll/entities/cvsresources/replacedcvsresource";
import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";

export class BriefDiffRowsParser {
    public constructor(private readonly tfPath: string,
                       private readonly tfsInfo: ITfsWorkFoldInfo,
                       private readonly cpProxy: CpProxy) {
        //
    }

    public async tryParseRows(briefDiffRows: string): Promise<CvsResource[]> {
        //All possible status codes: add|branch|delete|edit|lock|merge|rename|source rename|undelete
        const localResources: CvsResource[] = [];
        const parseBriefDiffRegExp: RegExp = /^(.*)?:\s(.*)$/mg;

        while (true) {
            const match: string[] = parseBriefDiffRegExp.exec(briefDiffRows);
            if (!match) {
                break;
            }
            if (BriefDiffRowsParser.isInCorrectFormat(match)) {
                const changeType: string = match[1].trim();
                const fileAbsPath: string = match[2].trim();
                await this.tryPushCvsResource(localResources, changeType, fileAbsPath);
            }
        }

        return localResources;
    }

    private static isInCorrectFormat(match: string[]): boolean {
        return match.length === 3 && match[2] !== "files differ";
    }

    private async tryPushCvsResource(resources: CvsResource[], changeType: string, fileAbsPath: string): Promise<void> {
        try {
            const resource: CvsResource = await this.getCvsResource(changeType, fileAbsPath);
            resources.push(resource);
        } catch (err) {
            Logger.logError(Utils.formatErrorMessage(err));
        }
    }

    private async getCvsResource(changeType: string, fileAbsPath: string): Promise<CvsResource> {
        const relativePath: string = path.relative(this.tfsInfo.projectLocalPath, fileAbsPath);
        let resource: CvsResource;

        if (changeType.indexOf(TfsChangeType.DELETE) !== -1) {
            resource = new DeletedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(relativePath));
        } else if (changeType.indexOf(TfsChangeType.ADD) !== -1
            || changeType.indexOf(TfsChangeType.BRANCH) !== -1
            || changeType.indexOf(TfsChangeType.UNDELETE) !== -1) {
            //undelete means restore items that were previously deleted
            resource = new AddedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(relativePath));
        } else if (changeType.indexOf(TfsChangeType.RENAME) !== -1) {
            const prevFileAbsPath = await this.getPrevFileNameIfExist(fileAbsPath);
            if (prevFileAbsPath === fileAbsPath
                && changeType.indexOf(TfsChangeType.EDIT) !== -1) {
                resource = new ModifiedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(relativePath));
            } else if (prevFileAbsPath) {
                const prevFileRelativePath: string = path.relative(this.tfsInfo.projectLocalPath, prevFileAbsPath);
                resource = new ReplacedCvsResource(fileAbsPath,
                    relativePath,
                    this.getServerFilePath(relativePath),
                    prevFileAbsPath,
                    this.getServerFilePath(prevFileRelativePath)
                );
            }
        } else if (changeType.indexOf(TfsChangeType.EDIT) !== -1) {
            resource = new ModifiedCvsResource(fileAbsPath, relativePath, this.getServerFilePath(relativePath));
        }

        return resource;
    }

    private getServerFilePath(relativePath: string) {
        const serverItems = this.tfsInfo.projectRemotePath + "/" + relativePath;
        return `tfs://${this.tfsInfo.repositoryUrl}${serverItems}`.replace(/\\/g, "/");
    }

    private async getPrevFileNameIfExist(fileAbsPath: string): Promise<string> {
        try {
            const tfsInfo: ITfsWorkFoldInfo = this.tfsInfo;
            const parseHistoryRegExp: RegExp = /(\$.*)$/;
            const historyCommand: string = `"${this.tfPath}" history /format:detailed /stopafter:1 ${fileAbsPath}`;
            const historyCommandOut = await this.cpProxy.execAsync(historyCommand);
            const tfsHistoryResultArray: string[] = historyCommandOut.stdout.toString().trim().split("\n");
            const lastHistoryRow = tfsHistoryResultArray[tfsHistoryResultArray.length - 1];
            const parsedLastHistoryRow: string[] = parseHistoryRegExp.exec(lastHistoryRow);
            if (parsedLastHistoryRow && parsedLastHistoryRow.length === 2) {
                const prevRelativePath: string = parsedLastHistoryRow[1].replace(tfsInfo.projectRemotePath, "");
                return path.join(tfsInfo.projectLocalPath, prevRelativePath);
            }
            Logger.logWarning(`BriefDiffRowsParser: can't parse last history command row`);
            return undefined;
        } catch (err) {
            Logger.logError("BriefDiffRowsParser: an error occurs during history command processing: " +
                Utils.formatErrorMessage(err));
            return undefined;
        }
    }
}

class TfsChangeType {
    public static readonly ADD = "add";
    public static readonly BRANCH = "branch";
    public static readonly DELETE = "delete";
    public static readonly EDIT = "edit";
    public static readonly UNDELETE = "undelete";
    public static readonly RENAME = "rename";
}
