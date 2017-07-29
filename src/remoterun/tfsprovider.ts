"use strict";

import { workspace, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { CheckinInfo, TfsInfo } from "../utils/interfaces";
import { CvsSupportProvider } from "./cvsprovider";
import * as cp from "child-process-promise";
import * as path from "path";
import * as url from "url";

export class TfsSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath : string;

    public constructor() {
        this._workspaceRootPath = workspace.rootPath;
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
        const tfsInfo : TfsInfo = await this.getTfsInfo();
        const serverUris : string[] = await this.getServerItems();
        serverUris.forEach((row) => {
            formatFilenames.push(`tfs://${tfsInfo.repositoryUrl}${row}`.replace(/\\/g, "/"));
        });
        return formatFilenames;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateConfigFileContent() : Promise<string> {
        const tfsInfo : TfsInfo = await this.getTfsInfo();
        return `${this._workspaceRootPath}=tfs://${tfsInfo.repositoryUrl}${tfsInfo.projectRemotePath}`;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Obly for git) In case of git there are no workItemIds
     * @return CheckinInfo object
     */
    public async getRequiredCheckinInfo() : Promise<CheckinInfo> {
        const commitMessage: string = scm.inputBox.value;
        const workItemIds: number[] = this.getWorkItemIdsFromMessage(commitMessage);
        const absPaths : string[] = await this.getAbsPaths();
        const serverItems : string[] = await this.getServerItems();
        return {
                files: absPaths,
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
    public async requestForPostCommit(checkinInfo : CheckinInfo) {
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
        if (nextGitOperation !== undefined && nextGitOperation.label === YES_LABEL) {
            const checkInCommandPrefix = `tf checkin /comment:"${checkinInfo.message}" /noprompt `;
            const checkInCommandSB : string[] = [];
            checkInCommandSB.push(checkInCommandPrefix);
            checkinInfo.files.forEach((filePath) => {
                checkInCommandSB.push(`"${filePath}" `);
            });
            try {
                await cp.exec(checkInCommandSB.join(""));
            } catch (err) {
                console.log(err);
            }
        }
    }

    /**
     * This method indicates whether the extension is active or not.
     */
    public async isActive() : Promise<boolean> {
        const tfsInfo : TfsInfo = await this.getTfsInfo();
        const serverItems = await this.getServerItems();
        if (serverItems && serverItems.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * This method requiests absPaths of changed files and replaces localProjectPath by $/projectName
     */
    private async getServerItems() : Promise<string[]> {
        const tfsInfo : TfsInfo = await this.getTfsInfo();
        const absPaths : string[] = await this.getAbsPaths();
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
        const tfsInfo : TfsInfo = await this.getTfsInfo();
        const parseBriefDiffRegexp : RegExp = /^(add|branch|delete|edit|lock|merge|rename|source rename|undelete):\s(.*)$/mg;
        const absPaths : string[] = [];
        const briefDiffCommand : string = `tf diff /noprompt /format:brief /recursive "${this._workspaceRootPath}"`;
        try {
            const outBriefDiff = await cp.exec(briefDiffCommand);
            const tfsWorkfoldResult : string = outBriefDiff.stdout.trim();
            let match = parseBriefDiffRegexp.exec(tfsWorkfoldResult);
            while (match) {
                absPaths.push(path.join(match[2], "."));
                match = parseBriefDiffRegexp.exec(tfsWorkfoldResult);
            }
            return absPaths;
        } catch (err) {
            return [];
        }
    }

    /**
     * This method returns some information about tfs repo by executing "tf workfold" command.
     */
    private async getTfsInfo() : Promise<TfsInfo> {
        const parseWorkfoldRegexp = /Collection: (.*?)\r\n\s(.*?):\s(.*)/;
        const getLocalRepoInfoCommand : string = `tf workfold "${this._workspaceRootPath}"`;
        try {
            const out = await cp.exec(getLocalRepoInfoCommand);
            const tfsWorkfoldResult : string = out.stdout.trim();
            const match = parseWorkfoldRegexp.exec(tfsWorkfoldResult);
            const repositoryUrl : string = match[1];
            const purl: url.Url = url.parse(repositoryUrl);
            if (purl) {
                const collectionName = purl.host.split(".")[0];
                return {
                    repositoryUrl: repositoryUrl,
                    collectionName: collectionName,
                    projectRemotePath: match[2],
                    projectLocalPath: match[3]
                };
            }else {
                return undefined;
            }
        } catch (err) {
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
                return [];
            }
            for (let i: number = 0; i < matches.length; i++) {
                const id: number = parseInt(matches[i].slice(1));
                if (!isNaN(id)) {
                    ids.push(id);
                }
            }
        } catch (err) {
            console.error("Failed to get all workitems from message: " + message);
        }
        return ids;
    }

}
