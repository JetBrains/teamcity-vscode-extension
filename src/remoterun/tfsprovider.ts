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

    public async getFormattedFilenames() : Promise<string[]> {
        const formatFilenames : string[] = [];
        const tfsInfo : TfsInfo = await this.getWorkfoldInfo();
        const serverUris : string[] = await this.getServerItems();
        serverUris.forEach((row) => {
            formatFilenames.push(`tfs://${tfsInfo.repositoryUrl}${row}`.replace(/\\/g, "/"));
        });
        return formatFilenames;
    }

    /**
     * This method uses tfs extension api to checkin info. It is required to execute post-commit.
     * @return CheckinInfo object
     */
    public async getRequiredCheckinInfo() : Promise<CheckinInfo> {
        const commitMessage: string = scm.inputBox.value;
        const absPaths : string[] = await this.getAbsPaths();
        const serverItems : string[] = await this.getServerItems();
        return {
                files: absPaths,
                message: commitMessage,
                serverItems: serverItems,
                workItemIds: []
            };
    }

    /**
     * Commit all staged (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
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

    public async isActive() : Promise<boolean> {
        const tfsInfo : TfsInfo = await this.getWorkfoldInfo();
        const serverItems = await this.getServerItems();
        if (serverItems && serverItems.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    private async getServerItems() : Promise<string[]> {
        const tfsInfo : TfsInfo = await this.getWorkfoldInfo();
        const absPaths : string[] = await this.getAbsPaths();
        const serverItems : string[] = [];
        absPaths.forEach((absPath) => {
            const relativePath = path.relative(tfsInfo.projectLocalPath, absPath);
            serverItems.push(path.join(tfsInfo.projectRemotePath, relativePath));
        });
        return serverItems;
    }

    private async getAbsPaths() : Promise<string[]> {
        const tfsInfo : TfsInfo = await this.getWorkfoldInfo();
        const parseBriefDiffRegexp : RegExp = /^(edit|delete|add):\s(.*)$/mg;
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
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateConfigFileContent() : Promise<string> {
        const tfsInfo : TfsInfo = await this.getWorkfoldInfo();
        return `${this._workspaceRootPath}=tfs://${tfsInfo.repositoryUrl}${tfsInfo.projectRemotePath}`;
    }

    private async getWorkfoldInfo() : Promise<TfsInfo> {
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

}
