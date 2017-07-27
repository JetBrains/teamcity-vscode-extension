"use strict";

import { workspace, SourceControlResourceState, extensions, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { Constants } from "../utils/constants";
import { CheckinInfo } from "../utils/interfaces";
import * as cp from "child-process-promise";
import * as path from "path";

export interface CvsSupportProvider {
    getFormattedFilenames() : Promise<string[]>;
    generateConfigFileContent() : Promise<string>;
    getRequiredCheckinInfo() : Promise<CheckinInfo>;
    requestForPostCommit(checkinInfo : CheckinInfo);
    isActive() : Promise<boolean>;
}

/**
 * This implementation of CvsSupportProvider uses git command line. So git should be in the user classpath.
 */
export class GitSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath : string;

    public constructor() {
        this._workspaceRootPath = workspace.rootPath;
    }

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFilenames() : Promise<string[]> {
        const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
        const changedFiles = api.getResources();

        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        const lastRevHash = await this.getLastRevision(remoteBranch);
        const formatedChangedFiles = [];
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        changedFiles.forEach((row) => {
            const absolutePath : string = row.resourceUri.fsPath;
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            formatedChangedFiles.push(`jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`);
        });
        return formatedChangedFiles;
    }

    private async getRemoteBrunch() {
        const getRemoteBranchCommand : string = `git -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = await cp.exec(getRemoteBranchCommand);
        const remoteBranch : string = prom.stdout;
        if (remoteBranch === undefined || remoteBranch.length === 0) {
            throw "Remote branch wasn't determined.";
        }
        return remoteBranch.replace(/'/g, "").trim();
    }

    private async getLastRevision(remoteBranch ) {
        const getLastRevCommand : string = `git -C "${this._workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
        const prom = await cp.exec(getLastRevCommand);
        const lastRevHash : string = prom.stdout;
        if (lastRevHash === undefined || lastRevHash.length === 0) {
            throw "Revision of last commit wasn't determined.";
        }
        return lastRevHash.trim();
    }

    private async getFirstMonthRev() {
        const date : Date = new Date();
        const getFirstMonthRevCommand : string = `git -C "${this._workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = await cp.exec(getFirstMonthRevCommand);
        let firstRevHash : string = prom.stdout;
        if (firstRevHash === undefined) {
            firstRevHash = "";
        }
        return firstRevHash.split("\n")[0];
    }

    /* Currently @username part of content was removed by me. TODO: understand what is it and for which purpose is it used. */
    public async generateConfigFileContent() : Promise<string> {
        const getRemoteUrlCommand : string = `git -C "${this._workspaceRootPath}" ls-remote --get-url`;
        const commandResult = await cp.exec(getRemoteUrlCommand);
        const remoteUrl : string = commandResult.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0) {
            throw "Remote url wasn't determined.";
        }
        return `${workspace.rootPath}=jetbrains.git://|${remoteUrl.trim()}|`;
    }

    /**
     * This method uses git extension api to get absolute paths of staged files.
     * @return absolute paths of staged files or [] if requiest was failed.
     */
    private async getAbsPaths() : Promise<string[]> {
        try {
            const absPaths : string[] = [];
            const getStagedFilesCommand : string = `git -C "${this._workspaceRootPath}" diff --name-only --staged`;
            const commandResult = await cp.exec(getStagedFilesCommand);
            if (!commandResult.stdout) {
                return [];
            }
            const stagedFilesRelarivePaths : string = commandResult.stdout.trim();
            stagedFilesRelarivePaths.split("\n").forEach((relativePath) => {
                absPaths.push(path.join(this._workspaceRootPath, stagedFilesRelarivePaths));
            });
            /* Wait till Microsoft provides the api for us.*/
            // const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
            // const changedFiles : SourceControlResourceState[] = api.getResources();
            // changedFiles.forEach((row) => {
            //     absPaths.push(row.resourceUri.fsPath);
            // });
            return absPaths;
        }catch (err) {
            return [];
        }
    }

    /**
     * This method uses git extension api to checkin info. It is required to execute post-commit.
     * In case of git there are no workItemIds
     * @return CheckinInfo object
     */
    public async getRequiredCheckinInfo() : Promise<CheckinInfo> {
        //Git extension bug: If commit message is empty git won't commit anything
        const commitMessage: string = scm.inputBox.value === "" ? "-" : scm.inputBox.value;
        const absPaths : string[] = await this.getAbsPaths();
        return {
                files: absPaths,
                message: commitMessage,
                serverItems: [],
                workItemIds: []
            };
    }

    /**
     * Commit all staged (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    public async requestForPostCommit(checkinInfo : CheckinInfo) {
        const choices: QuickPickItem[] = [];
        const GIT_COMMIT_PUSH_INTRO_MESSAGE = "Whould you like to commit/push your changes?";
        const NO_LABEL : string = "No, thank you";
        const COMMIT_LABEL : string = "Commit (without Push)";
        const COMMIT_AND_PUSH_LABEL : string = "Commit and Push";
        choices.push({ label: NO_LABEL, description: undefined });
        choices.push({ label: COMMIT_LABEL, description: undefined });
        /*
            I can't understand how to take correct corresponding remote branch, so TODO: implement it!
            choices.push({ label: COMMIT_AND_PUSH_LABEL, description: undefined });
        */
        const options : QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: GIT_COMMIT_PUSH_INTRO_MESSAGE
        };
        const nextGitOperation : QuickPickItem = await window.showQuickPick(choices, options);
        if (nextGitOperation === undefined) {
            return;
        }
        if (nextGitOperation.label === COMMIT_LABEL) {
            const commitCommand : string = `git -C "${this._workspaceRootPath}" commit -m "${checkinInfo.message}"`;
            const commandResult = await cp.exec(commitCommand);
            /* Wait till Microsoft provides the api for us. */
            // const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
            // await api.commitStagedWithMessage(checkinInfo.message);
        }
        if (nextGitOperation.label === COMMIT_AND_PUSH_LABEL) {
            const commitCommand : string = `git -C "${this._workspaceRootPath}" commit -m "${checkinInfo.message}"`;
            try {
                await cp.exec(commitCommand);
            } catch (err) {
                console.error(err);
            }
            const remoteBranch : string = await this.getRemoteBrunch();
            try {
                const pushCommand : string = `git -C "${this._workspaceRootPath}" push ${remoteBranch} HEAD"`;
                await cp.exec(pushCommand);
            } catch (err) {
                console.error(err);
            }
            /* Wait till Microsoft provides the api for us. */
            // const api = extensions.getExtension(Constants.GIT_EXTENSION_ID).exports;
            // await api.commitStagedWithMessage(checkinInfo.message);
            // await api.push();
        }
    }

    public async isActive() : Promise<boolean> {
        const changedFiles : string[] = await this.getAbsPaths();
        return changedFiles.length > 0;
    }
}

export class TfsSupportProvider implements CvsSupportProvider {

    public async getFormattedFilenames() : Promise<string[]> {
        const formatFilenames : string[] = [];
        const api : any = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports;
        const guid : string = api.getRepositoryInfo().collectionId;
        const serverUris : string[] = api.getCheckinInfo().serverItems;
        if ( serverUris === undefined ) {
            return [];
        }
        serverUris.forEach((row) => {
            formatFilenames.push(`tfs://guid://${guid}/${row}`);
        });
        return formatFilenames;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     */
    public async generateConfigFileContent() : Promise<string> {
        const api : any = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports;
        const repoInfo = api.getRepositoryInfo();
        const guid : string = repoInfo.collectionId;
        const projectRootPath : string = repoInfo.projectName + repoInfo.path;
        return `${workspace.rootPath}=tfs://guid://${guid.trim()}/$/${projectRootPath.trim()}`;
    }

    /**
     * This method uses tfs extension api to checkin info. It is required to execute post-commit.
     * @return CheckinInfo object
     */
    public getRequiredCheckinInfo() : Promise<CheckinInfo> {
        return extensions.getExtension(Constants.TFS_EXTENSION_ID).exports.getCheckinInfo();
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
            const api : any = extensions.getExtension(Constants.TFS_EXTENSION_ID).exports;
            await api.checkinFromExternalSystem(checkinInfo);
        }
    }

    public async isActive() : Promise<boolean> {
        const tfsExt = extensions.getExtension(Constants.TFS_EXTENSION_ID);
        try {
            const isActive = tfsExt.isActive;
            if (tfsExt.isActive && tfsExt.exports.getCheckinInfo().files.length > 0) {
                    return true;
            }
        }catch (err) {
            console.log(err);
            //An exception means that Tfs extension isn't active at the moment
        }
        return false;
    }
}
