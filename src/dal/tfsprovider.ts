"use strict";

import * as url from "url";
import * as path from "path";
import {Logger} from "../bll/utils/logger";
import * as cp from "child-process-promise";
import {CvsSupportProvider} from "./cvsprovider";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import {CvsFileStatusCode} from "../bll/utils/constants";
import {workspace, scm, QuickPickItem, QuickPickOptions, window} from "vscode";
import {CvsLocalResource} from "../bll/entities/cvslocalresource";
import {MappingFileContent} from "../bll/remoterun/mappingfilecontent";
import {CheckInInfo} from "../bll/remoterun/checkininfo";

export class TfsSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath: string;
    private _checkInInfo: CheckInInfo;
    private _tfsInfo: TfsWorkFoldInfo;
    private _tfPath: string;

    public constructor(tfPath: string) {
        this._workspaceRootPath = workspace.rootPath;
        this._tfPath = tfPath;
    }

    public async init() {
        this._tfsInfo = await this.getTfsInfo();
        this._checkInInfo = await this.getRequiredCheckInInfo();
        Logger.logDebug(`TfsSupportProvider#init: TfsSupportProvider was initialized`);
    }

    /**
     * There are two allowed tfs file path formats:
     * * File path format : http[s]://<server-path>:<server-port>/$foo/bar
     * * File path format : guid://guid/$foo/bar
     * We use first, because we can get user collection guid without his credential.
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFileNames(): Promise<string[]> {
        const formatFileNames: string[] = [];
        const tfsInfo: TfsWorkFoldInfo = this._tfsInfo;
        const cvsResources: CvsLocalResource[] = this._checkInInfo.cvsLocalResources;
        cvsResources.forEach((resource) => {
            const relativePath = path.relative(tfsInfo.projectLocalPath, resource.fileAbsPath);
            const serverItems = tfsInfo.projectRemotePath + "/" + relativePath;
            formatFileNames.push(`tfs://${tfsInfo.repositoryUrl}${serverItems}`.replace(/\\/g, "/"));
        });
        Logger.logDebug(`TfsSupportProvider#getFormattedFilenames: formatFileNames: ${formatFileNames.join(" ")}`);
        return formatFileNames;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateMappingFileContent(): Promise<MappingFileContent> {
        const tfsInfo: TfsWorkFoldInfo = this._tfsInfo;
        const mappingFileContent: MappingFileContent = {
            localRootPath: this._workspaceRootPath,
            tcProjectRootPath: `tfs://${tfsInfo.repositoryUrl}${tfsInfo.projectRemotePath}`,
            fullContent: `${this._workspaceRootPath}=tfs://${tfsInfo.repositoryUrl}${tfsInfo.projectRemotePath}`
        };
        Logger.logInfo(`TfsSupportProvider#generateConfigFileContent: configFileContent: ${mappingFileContent.fullContent}`);
        return mappingFileContent;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Only for git) In case of git there are no workItemIds
     * @return CheckInInfo object
     */
    public async getRequiredCheckInInfo(): Promise<CheckInInfo> {
        if (this._checkInInfo) {
            Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: checkIn info already exists`);
            return this._checkInInfo;
        }
        Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: should get checkIn info`);
        const commitMessage: string = scm.inputBox.value;
        const workItemIds: number[] = TfsSupportProvider.getWorkItemIdsFromMessage(commitMessage);
        const cvsLocalResources: CvsLocalResource[] = await this.getLocalResources();
        const serverItems: string[] = await this.getServerItems(cvsLocalResources);
        return {
            cvsLocalResources: cvsLocalResources,
            message: commitMessage,
            serverItems: serverItems,
            workItemIds: workItemIds
        };
    }

    /**
     * Commit all staged/changed (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    public async requestForPostCommit() {
        const choices: QuickPickItem[] = [];
        const TFS_COMMIT_PUSH_INTRO_MESSAGE = "Would you like to commit your changes?";
        const NO_LABEL: string = "No, thank you";
        const YES_LABEL: string = "Yes";
        choices.push({label: NO_LABEL, description: undefined});
        choices.push({label: YES_LABEL, description: undefined});
        const options: QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: TFS_COMMIT_PUSH_INTRO_MESSAGE
        };
        const nextTfsOperation: QuickPickItem = await window.showQuickPick(choices, options);
        Logger.logDebug(`TfsSupportProvider#requestForPostCommit: user picked ${nextTfsOperation ? nextTfsOperation.label : "nothing"}`);
        if (nextTfsOperation !== undefined && nextTfsOperation.label === YES_LABEL) {
            const checkInCommandPrefix = `"${this._tfPath}" checkIn /comment:"${this._checkInInfo.message}" /noprompt `;
            const checkInCommandSB: string[] = [];
            checkInCommandSB.push(checkInCommandPrefix);
            this._checkInInfo.cvsLocalResources.forEach((filePath) => {
                checkInCommandSB.push(`"${filePath}" `);
            });
            try {
                await cp.exec(checkInCommandSB.join(""));
            } catch (err) {
                Logger.logError(`TfsSupportProvider#requestForPostCommit: caught an exception during attempt to commit: ${VsCodeUtils.formatErrorMessage(err)}}`);
                throw new Error("Caught an exception during attempt to commit");
            }
        }
    }

    /**
     * Sets files for remote run, when user wants to provide them manually.
     */
    setFilesForRemoteRun(resources: CvsLocalResource[]) {
        this._checkInInfo.cvsLocalResources = resources;
    }

    /**
     * For some Cvs staged files and files at the file system aren't the same.
     * If they are not the same this method @returns ReadStream with content of the specified file.
     * Otherwise this method @returns undefined and we can use a content of the file from the file system.
     */
    public getStagedFileContentStream(fileAbsPath: string): undefined {
        return undefined;
    }

    /**
     * This method requests absPaths of changed files and replaces localProjectPath by $/projectName
     */
    private async getServerItems(cvsLocalResources: CvsLocalResource[]): Promise<string[]> {
        const tfsInfo: TfsWorkFoldInfo = this._tfsInfo;
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
        const tfsInfo: TfsWorkFoldInfo = this._tfsInfo;
        /*
         List of all possible status codes: add|branch|delete|edit|lock|merge|rename|source rename|undelete
         const parseBriefDiffRegexp : RegExp = /^(add|delete|edit|rename):\s(.*)$/mg;
         */
        const parseBriefDiffRegExp: RegExp = /^(.*)?:\s(.*)$/mg;
        const localResources: CvsLocalResource[] = [];
        const briefDiffCommand: string = `"${this._tfPath}" diff /noprompt /format:brief /recursive "${this._workspaceRootPath}"`;
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

            let status: CvsFileStatusCode;
            const changeType: string = match[1].trim();
            const fileAbsPath: string = path.join(match[2].trim(), ".");
            let prevFileAbsPath: string = undefined;
            if (changeType.indexOf(TfsChangeType.DELETE) !== -1) {
                status = CvsFileStatusCode.DELETED;
            } else if (changeType.indexOf(TfsChangeType.ADD) !== -1
                || changeType.indexOf(TfsChangeType.BRANCH) !== -1
                || changeType.indexOf(TfsChangeType.UNDELETE) !== -1) {
                //undelete means restore items that were previously deleted
                status = CvsFileStatusCode.ADDED;
            } else if (changeType.indexOf(TfsChangeType.RENAME) !== -1) {
                prevFileAbsPath = await this.getPrevFileNameIfExist(fileAbsPath);
                if (prevFileAbsPath === fileAbsPath
                    && changeType.indexOf(TfsChangeType.EDIT) !== -1) {
                    status = CvsFileStatusCode.MODIFIED;
                } else if (prevFileAbsPath) {
                    status = CvsFileStatusCode.RENAMED;
                }
            } else if (changeType.indexOf(TfsChangeType.EDIT) !== -1) {
                status = CvsFileStatusCode.MODIFIED;
            }

            if (status) {
                localResources.push(new CvsLocalResource(status, fileAbsPath, path.relative(tfsInfo.projectLocalPath, fileAbsPath) /*label*/, prevFileAbsPath));
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
            const tfsInfo: TfsWorkFoldInfo = this._tfsInfo;
            const parseHistoryRegExp: RegExp = /(\$.*)$/;
            const historyCommand: string = `"${this._tfPath}" history /noprompt /format:detailed /stopafter:1 ${fileAbsPath}`;
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
    private async getTfsInfo(): Promise<TfsWorkFoldInfo> {
        const parseWorkfoldRegexp = /Collection: (.*?)\r\n\s(.*?):\s(.*)/;
        const getLocalRepoInfoCommand: string = `"${this._tfPath}" workfold "${this._workspaceRootPath}"`;
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
                Logger.logDebug("TfsSupportProvider#getWorkItemIdsFromMessage: no one work item was found");
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
