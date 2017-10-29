"use strict";

import * as url from "url";
import * as path from "path";
import {Logger} from "../bll/utils/logger";
import * as cp from "child-process-promise";
import {CvsSupportProvider} from "./cvsprovider";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {CvsProviderTypes} from "../bll/utils/constants";
import {QuickPickItem, QuickPickOptions, scm, Uri, workspace} from "vscode";
import {CvsLocalResource} from "../bll/entities/cvsresources/cvslocalresource";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {TfvcPathFinder} from "../bll/cvsutils/tfvcpathfinder";
import {Finder} from "../bll/cvsutils/finder";
import {Validator} from "../bll/cvsutils/validator";
import {TfvcIsActiveValidator} from "../bll/cvsutils/tfvcisactivevalidator";
import {DeletedCvsResource} from "../bll/entities/cvsresources/deletedcvsresource";
import {AddedCvsResource} from "../bll/entities/cvsresources/addedcvsresource";
import {ModifiedCvsResource} from "../bll/entities/cvsresources/modifiedcvsresource";
import {ReplacedCvsResource} from "../bll/entities/cvsresources/replacedcvsresource";

export class TfvcSupportProvider implements CvsSupportProvider {
    private workspaceRootPath: string;
    private workspaceRootPathAsUri: Uri;
    private tfsInfo: TfsWorkFoldInfo;
    private tfPath: string;

    private constructor(rootPath: Uri) {
        this.workspaceRootPathAsUri = rootPath;
        this.workspaceRootPath = rootPath.fsPath;
    }

    public static async tryActivateInPath(workspaceRootPath: Uri): Promise<CvsSupportProvider> {
        const instance: TfvcSupportProvider = new TfvcSupportProvider(workspaceRootPath);
        const pathFinder: Finder = new TfvcPathFinder();
        const tfPath: string = await pathFinder.find();
        const isActiveValidator: Validator = new TfvcIsActiveValidator(tfPath);
        await isActiveValidator.validate();
        const tfsInfo: TfsWorkFoldInfo = await instance.getTfsInfo(tfPath, instance.workspaceRootPath);
        instance.tfPath = tfPath;
        instance.tfsInfo = tfsInfo;
        return instance;
    }

    /**
     * There are two allowed tfs file path formats:
     * * File path format : http[s]://<server-path>:<server-port>/$foo/bar
     * * File path format : guid://guid/$foo/bar
     * We use first, because we can get user collection guid without his credential.
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]> {
        const formatFileNames: string[] = [];
        const cvsResources: CvsLocalResource[] = checkInInfo.cvsLocalResources;
        cvsResources.forEach((localResource) => {
            formatFileNames.push(localResource.serverFilePath);
        });
        Logger.logDebug(`TfsSupportProvider#getFormattedFilenames: formatFileNames: ${formatFileNames.join(" ")}`);
        return formatFileNames;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Only for git) In case of git there are no workItemIds
     * @return CheckInInfo object
     */
    public async getRequiredCheckInInfo(): Promise<CheckInInfo> {
        Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: should get checkIn info`);
        const cvsLocalResources: CvsLocalResource[] = await this.getLocalResources();
        const serverItems: string[] = await this.getServerItems(cvsLocalResources);
        await this.fillInServerPaths(cvsLocalResources);
        const cvsProvider: CvsSupportProvider = this;
        return new CheckInInfo(cvsLocalResources, cvsProvider, serverItems);
    }

    private async fillInServerPaths(cvsLocalResources: CvsLocalResource[]): Promise<void> {
        const tfsInfo: TfsWorkFoldInfo = this.tfsInfo;
        cvsLocalResources.forEach((localResource) => {
            const relativePath = path.relative(tfsInfo.projectLocalPath, localResource.fileAbsPath);
            const serverItems = tfsInfo.projectRemotePath + "/" + relativePath;
            localResource.serverFilePath = `tfs://${tfsInfo.repositoryUrl}${serverItems}`.replace(/\\/g, "/");
            if (localResource.prevFileAbsPath) {
                const relativePath = path.relative(tfsInfo.projectLocalPath, localResource.prevFileAbsPath);
                const serverItems = tfsInfo.projectRemotePath + "/" + relativePath;
                localResource.prevServerFilePath = `tfs://${tfsInfo.repositoryUrl}${serverItems}`.replace(/\\/g, "/");
            }
        });
    }

    public async commit(checkInInfo: CheckInInfo) {
        const checkInCommandPrefix = `"${this.tfPath}" checkIn /comment:"${checkInInfo.message}" /noprompt `;
        const checkInCommandSB: string[] = [];
        checkInCommandSB.push(checkInCommandPrefix);
        checkInInfo.cvsLocalResources.forEach((localResource) => {
            checkInCommandSB.push(`"${localResource.fileAbsPath}" `);
        });
        try {
            await cp.exec(checkInCommandSB.join(""));
        } catch (err) {
            Logger.logError(`TfsSupportProvider#requestForPostCommit: caught an exception during attempt to commit: ${VsCodeUtils.formatErrorMessage(err)}}`);
            throw new Error("Caught an exception during attempt to commit");
        }
    }

    public async commitAndPush(checkInInfo: CheckInInfo) {
        return this.commit(checkInInfo);
    }

    /**
     * For some Cvs staged files and files at the file system aren't the same.
     * If they are not the same this method @returns ReadStream with content of the specified file.
     * Otherwise this method @returns undefined and we can use a content of the file from the file system.
     */
    public getStagedFileContentStream(cvsResource: CvsLocalResource): undefined {
        return undefined;
    }

    /**
     * This method requests absPaths of changed files and replaces localProjectPath by $/projectName
     */
    private async getServerItems(cvsLocalResources: CvsLocalResource[]): Promise<string[]> {
        const tfsInfo: TfsWorkFoldInfo = this.tfsInfo;
        const serverItems: string[] = [];
        cvsLocalResources.forEach((localResource) => {
            const relativePath = path.relative(tfsInfo.projectLocalPath, localResource.fileAbsPath);
            serverItems.push(path.join(tfsInfo.projectRemotePath, relativePath));
        });
        return serverItems;
    }

    /**
     * It's using "tf diff" command, to get required info about changed files.
     */
    private async getLocalResources(): Promise<CvsLocalResource[]> {
        const tfsInfo: TfsWorkFoldInfo = this.tfsInfo;
        /*
         List of all possible status codes: add|branch|delete|edit|lock|merge|rename|source rename|undelete
         const parseBriefDiffRegexp : RegExp = /^(add|delete|edit|rename):\s(.*)$/mg;
         */
        const parseBriefDiffRegExp: RegExp = /^(.*)?:\s(.*)$/mg;
        const localResources: CvsLocalResource[] = [];
        const briefDiffCommand: string = `"${this.tfPath}" diff /noprompt /format:brief /recursive "${this.workspaceRootPath}"`;
        let tfsDiffResult: string;
        try {
            const briefDiffCommandOutput = await cp.exec(briefDiffCommand);
            tfsDiffResult = briefDiffCommandOutput.stdout.toString("utf8").trim();
        } catch (err) {
            Logger.logError(`TfsSupportProvider#getAbsPaths: caught an exception during tf diff command: ${VsCodeUtils.formatErrorMessage(err)}`);
            return [];
        }
        let match = parseBriefDiffRegExp.exec(tfsDiffResult);
        while (match) {
            /*
             It looks for lines at the format: /^(changeType): (fileAbsPath)$/
             !!! There are incompatible lines at the format: /^(fileAbsPath): files differ$/
             */
            if (match.length !== 3 || match[2] === "files differ") {
                match = parseBriefDiffRegExp.exec(tfsDiffResult);
                continue;
            }
            const changeType: string = match[1].trim();
            const fileAbsPath: string = path.join(match[2].trim(), ".");
            let prevFileAbsPath: string = undefined;
            const relativePath: string = path.relative(tfsInfo.projectLocalPath, fileAbsPath);
            if (changeType.indexOf(TfsChangeType.DELETE) !== -1) {
                localResources.push(new DeletedCvsResource(fileAbsPath, relativePath));
            } else if (changeType.indexOf(TfsChangeType.ADD) !== -1
                || changeType.indexOf(TfsChangeType.BRANCH) !== -1
                || changeType.indexOf(TfsChangeType.UNDELETE) !== -1) {
                //undelete means restore items that were previously deleted
                localResources.push(new AddedCvsResource(fileAbsPath, relativePath));
            } else if (changeType.indexOf(TfsChangeType.RENAME) !== -1) {
                prevFileAbsPath = await this.getPrevFileNameIfExist(fileAbsPath);
                if (prevFileAbsPath === fileAbsPath
                    && changeType.indexOf(TfsChangeType.EDIT) !== -1) {
                    localResources.push(new ModifiedCvsResource(fileAbsPath, relativePath));
                } else if (prevFileAbsPath) {
                    localResources.push(new ReplacedCvsResource(fileAbsPath, relativePath, prevFileAbsPath));
                }
            } else if (changeType.indexOf(TfsChangeType.EDIT) !== -1) {
                localResources.push(new ModifiedCvsResource(fileAbsPath, relativePath));
            }

            match = parseBriefDiffRegExp.exec(tfsDiffResult);
        }
        Logger.logDebug(`TfsSupportProvider#getAbsPaths: ${localResources.length} changed resources was detected`);
        return localResources;
    }

    /**
     * This method uses command "history" to determine previous absPath of the file if it was renamed
     * @param fileAbsPath - current absPath of the file
     * @return previous absPath when it was successfully determined otherwise undefined
     */
    private async getPrevFileNameIfExist(fileAbsPath: string): Promise<string> {
        try {
            const tfsInfo: TfsWorkFoldInfo = this.tfsInfo;
            const parseHistoryRegExp: RegExp = /(\$.*)$/;
            const historyCommand: string = `"${this.tfPath}" history /format:detailed /stopafter:1 ${fileAbsPath}`;
            const historyCommandOut = await cp.exec(historyCommand);
            const tfsHistoryResultArray: string[] = historyCommandOut.stdout.toString("utf8").trim().split("\n");
            /*
             The last row of the history command output should be at the format:
             /^ (previous operation with file)\s+(previous remoteFileName started with $)$/
             */
            const lastHistoryRow = tfsHistoryResultArray[tfsHistoryResultArray.length - 1];
            const parsedLastHistoryRow: string[] = parseHistoryRegExp.exec(lastHistoryRow);
            if (parsedLastHistoryRow && parsedLastHistoryRow.length === 2) {
                const prevRelativePath: string = parsedLastHistoryRow[1].replace(tfsInfo.projectRemotePath, "");
                return path.join(tfsInfo.projectLocalPath, prevRelativePath);
            }
            Logger.logWarning(`TfsSupportProvider#getPrevFileNameIfExist: can't parse last history command row`);
            return undefined;
        } catch (err) {
            Logger.logError(`TfsSupportProvider#getPrevFileNameIfExist: an error occurs during history command processing: ${VsCodeUtils.formatErrorMessage(err)}`);
            return undefined;
        }
    }

    /**
     * This method returns some information about tfs repo by executing "tf workfold" command.
     */
    private async getTfsInfo(tfPath: string, workspaceRootPath: string): Promise<TfsWorkFoldInfo> {
        const parseWorkfoldRegexp = /Collection: (.*?)\r\n\s(.*?):\s(.*)/;
        const getLocalRepoInfoCommand: string = `"${tfPath}" workfold "${workspaceRootPath}"`;
        try {
            const out = await cp.exec(getLocalRepoInfoCommand);
            const tfsWorkfoldResult: string = out.stdout.toString("utf8").trim();
            const match = parseWorkfoldRegexp.exec(tfsWorkfoldResult);
            const repositoryUrl: string = match[1];
            const purl: url.Url = url.parse(repositoryUrl);
            if (purl) {
                const collectionName = purl.host.split(".")[0];
                const tfsInfo: TfsWorkFoldInfo = {
                    repositoryUrl: repositoryUrl,
                    collectionName: collectionName,
                    projectRemotePath: match[2],
                    projectLocalPath: match[3]
                };
                Logger.LogObject(tfsInfo);
                return tfsInfo;
            } else {
                Logger.logError(`TfsSupportProvider#getTfsInfo: TfsInfo cannot be parsed.`);
                return undefined;
            }
        } catch (err) {
            Logger.logError(`TfsSupportProvider#getTfsInfo: caught an exception during tf workfold command: ${VsCodeUtils.formatErrorMessage(err)}`);
            return undefined;
        }
    }

    /**
     *  Find all the work item mentions in the string.
     *  This returns an array like: ["#1", "#12", "#33"]
     */
    private static getWorkItemIdsFromMessage(message: string): number[] {
        const ids: number[] = [];
        try {
            const matches: string[] = message ? message.match(/#(\d+)/gm) : [];
            if (!matches) {
                Logger.logDebug("TfvcSupportProvider#getWorkItemIdsFromMessage: no one work item was found");
                return [];
            }
            for (let i: number = 0; i < matches.length; i++) {
                const id: number = parseInt(matches[i].slice(1));
                if (!isNaN(id)) {
                    ids.push(id);
                }
            }
            Logger.logDebug(`TfsSupportProvider#getWorkItemIdsFromMessage:found next workItems ${ids.join(",")}`);
        } catch (err) {
            Logger.logError(`TfsSupportProvider#getWorkItemIdsFromMessage: failed to get all workitems from message: ${message} with error: ${VsCodeUtils.formatErrorMessage(err)}`);
        }
        return ids;
    }

    public getRootPath(): string {
        return this.workspaceRootPath;
    }

    public allowStaging(): boolean {
        return false;
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

interface TfsWorkFoldInfo {
    repositoryUrl: string;
    collectionName: string;
    projectLocalPath: string;
    projectRemotePath: string;
}
