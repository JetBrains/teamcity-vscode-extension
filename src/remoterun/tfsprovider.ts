"use strict";

import { workspace, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { CheckinInfo, TfsInfo } from "../utils/interfaces";
import { CvsSupportProvider } from "./cvsprovider";
import { Logger } from "../utils/logger";
import { VsCodeUtils } from "../utils/vscodeutils";
import * as cp from "child-process-promise";
import * as path from "path";
import * as url from "url";

export class TfsSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath : string;
    private _checkinInfo : CheckinInfo;
    private _tfsInfo : TfsInfo;
    private _tfPath : string;

    public constructor(tfPath: string) {
        this._workspaceRootPath = workspace.rootPath;
        this._tfPath = tfPath;
    }

    public async init() {
        this._tfsInfo = await this.getTfsInfo();
        this._checkinInfo = await this.getRequiredCheckinInfo();
        Logger.logDebug(`TfsSupportProvider#init: TfsSupportProvider was initialized`);
    }

    /**
     * There are two allowed tfs file path formats:
     * * File path format : http[s]://<server-path>:<server-port>/$foo/bar
     * * File path format : guid://guid/$foo/bar
     * We use first, because we can get user collection guid without his credential.
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFilenames() : Promise<string[]> {
        const formatFilenames : string[] = [];
        const tfsInfo : TfsInfo = this._tfsInfo;
        const serverUris : string[] = this._checkinInfo.serverItems;
        serverUris.forEach((row) => {
            formatFilenames.push(`tfs://${tfsInfo.repositoryUrl}${row}`.replace(/\\/g, "/"));
        });
        Logger.logDebug(`TfsSupportProvider#getFormattedFilenames: formatFilenames: ${formatFilenames.join(" ")}`);
        return formatFilenames;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateConfigFileContent() : Promise<string> {
        const tfsInfo : TfsInfo = this._tfsInfo;
        const configFileContent : string = `${this._workspaceRootPath}=tfs://${tfsInfo.repositoryUrl}${tfsInfo.projectRemotePath}`;
        Logger.logInfo(`TfsSupportProvider#generateConfigFileContent: configFileContent: ${configFileContent}`);
        return configFileContent;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Obly for git) In case of git there are no workItemIds
     * @return CheckinInfo object
     */
    public async getRequiredCheckinInfo() : Promise<CheckinInfo> {
        if (this._checkinInfo) {
            Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: checkin info already exists`);
            return this._checkinInfo;
        }
        Logger.logDebug(`TfsSupportProvider#getRequiredCheckinInfo: should get checkin info`);
        const commitMessage: string = scm.inputBox.value;
        const workItemIds: number[] = this.getWorkItemIdsFromMessage(commitMessage);
        const absPaths : string[] = await this.getAbsPaths();
        const serverItems : string[] = await this.getServerItems(absPaths);
        return {
                fileAbsPaths: absPaths,
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
        const TFS_COMMIT_PUSH_INTRO_MESSAGE = "Whould you like to commit your changes?";
        const NO_LABEL : string = "No, thank you";
        const YES_LABEL : string = "Yes";
        choices.push({ label: NO_LABEL, description: undefined });
        choices.push({ label: YES_LABEL, description: undefined });
        const options : QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: TFS_COMMIT_PUSH_INTRO_MESSAGE
        };
        const nextGitOperation : QuickPickItem = await window.showQuickPick(choices, options);
        Logger.logDebug(`TfsSupportProvider#requestForPostCommit: user picked ${nextGitOperation ? nextGitOperation.label : "nothing"}`);
        if (nextGitOperation !== undefined && nextGitOperation.label === YES_LABEL) {
            const checkInCommandPrefix = `"${this._tfPath}" checkin /comment:"${this._checkinInfo.message}" /noprompt `;
            const checkInCommandSB : string[] = [];
            checkInCommandSB.push(checkInCommandPrefix);
            this._checkinInfo.fileAbsPaths.forEach((filePath) => {
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
     * This method requiests absPaths of changed files and replaces localProjectPath by $/projectName
     */
    private async getServerItems(absPaths : string[]) : Promise<string[]> {
        const tfsInfo : TfsInfo = this._tfsInfo;
        const serverItems : string[] = [];
        absPaths.forEach((absPath) => {
            const relativePath = path.relative(tfsInfo.projectLocalPath, absPath);
            serverItems.push(path.join(tfsInfo.projectRemotePath, relativePath));
        });
        return serverItems;
    }

    /**
     * We are using "tf diff" command, to get required info about changed files.
     */
    private async getAbsPaths() : Promise<string[]> {
        const tfsInfo : TfsInfo = this._tfsInfo;
        const parseBriefDiffRegexp : RegExp = /^(add|branch|delete|edit|lock|merge|rename|source rename|undelete):\s(.*)$/mg;
        const absPaths : string[] = [];
        const briefDiffCommand : string = `"${this._tfPath}" diff /noprompt /format:brief /recursive "${this._workspaceRootPath}"`;
        try {
            const outBriefDiff = await cp.exec(briefDiffCommand);
            const tfsWorkfoldResult : string = outBriefDiff.stdout.toString("utf8").trim();
            let match = parseBriefDiffRegexp.exec(tfsWorkfoldResult);
            while (match) {
                absPaths.push(path.join(match[2], "."));
                match = parseBriefDiffRegexp.exec(tfsWorkfoldResult);
            }
            return absPaths;
        } catch (err) {
            Logger.logError(`TfsSupportProvider#getAbsPaths: caught an exception during tf diff command: ${VsCodeUtils.formatErrorMessage(err)}`);
            return [];
        }
    }

    /**
     * This method returns some information about tfs repo by executing "tf workfold" command.
     */
    private async getTfsInfo() : Promise<TfsInfo> {
        const parseWorkfoldRegexp = /Collection: (.*?)\r\n\s(.*?):\s(.*)/;
        const getLocalRepoInfoCommand : string = `"${this._tfPath}" workfold "${this._workspaceRootPath}"`;
        try {
            const out = await cp.exec(getLocalRepoInfoCommand);
            const tfsWorkfoldResult : string = out.stdout.toString("utf8").trim();
            const match = parseWorkfoldRegexp.exec(tfsWorkfoldResult);
            const repositoryUrl : string = match[1];
            const purl: url.Url = url.parse(repositoryUrl);
            if (purl) {
                const collectionName = purl.host.split(".")[0];
                const tfsInfo : TfsInfo = {
                    repositoryUrl: repositoryUrl,
                    collectionName: collectionName,
                    projectRemotePath: match[2],
                    projectLocalPath: match[3]
                };
                Logger.LogObject(tfsInfo);
                return tfsInfo;
            }else {
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
    private getWorkItemIdsFromMessage(message: string) : number[] {
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
