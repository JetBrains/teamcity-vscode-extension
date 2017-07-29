"use strict";

import { workspace, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { CvsSupportProvider } from "./cvsprovider";
import { CheckinInfo } from "../utils/interfaces";
import * as cp from "child-process-promise";
import * as path from "path";

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
        const getAbsPaths : string[] = await this.getAbsPaths();
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        const lastRevHash = await this.getLastRevision(remoteBranch);
        const formatedChangedFiles = [];
        getAbsPaths.forEach((absolutePath) => {
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            formatedChangedFiles.push(`jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`);
        });
        return formatedChangedFiles;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     * (for git only) Currently @username part of content was removed. TODO: understand what is it and for which purpose is it used.
     */
    public async generateConfigFileContent() : Promise<string> {
        const getRemoteUrlCommand : string = `git -C "${this._workspaceRootPath}" ls-remote --get-url`;
        const commandResult = await cp.exec(getRemoteUrlCommand);
        const remoteUrl : string = commandResult.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0) {
            throw "Remote url wasn't determined.";
        }
        return `${this._workspaceRootPath}=jetbrains.git://|${remoteUrl.trim()}|`;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Obly for git) In case of git there are no workItemIds
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
     * Commit all staged/changed (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    public async requestForPostCommit(checkinInfo : CheckinInfo) : Promise<void> {
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
            //Do nothing!
        } else if (nextGitOperation.label === COMMIT_LABEL) {
            const commitCommand : string = `git -C "${this._workspaceRootPath}" commit -m "${checkinInfo.message}"`;
            await cp.exec(commitCommand);
        } else if (nextGitOperation.label === COMMIT_AND_PUSH_LABEL) {
            const commitCommand : string = `git -C "${this._workspaceRootPath}" commit -m "${checkinInfo.message}"`;
            await cp.exec(commitCommand);
            const remoteBranch : string = await this.getRemoteBrunch();
            const pushCommand : string = `git -C "${this._workspaceRootPath}" push ${remoteBranch} HEAD"`;
            await cp.exec(pushCommand);
        }
    }

    /**
     * This method indicates whether the extension is active or not.
     */
    public async isActive() : Promise<boolean> {
        const changedFiles : string[] = await this.getAbsPaths();
        return changedFiles.length > 0;
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
            return absPaths;
        }catch (err) {
            return [];
        }
    }

    /**
     * This method uses the "git branch -vv" command
     */
    private async getRemoteBrunch() : Promise<string> {
        const getRemoteBranchCommand : string = `git -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = await cp.exec(getRemoteBranchCommand);
        const remoteBranch : string = prom.stdout;
        if (remoteBranch === undefined || remoteBranch.length === 0) {
            throw "Remote branch wasn't determined.";
        }
        return remoteBranch.replace(/'/g, "").trim();
    }

    /**
     * IT IS NOT THE LATEST REVISION IN THE LOCAL REPO. This method returns the last compatible revision by the "git merge-base" command.
     */
    private async getLastRevision(remoteBranch) : Promise<string> {
        const getLastRevCommand : string = `git -C "${this._workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
        const prom = await cp.exec(getLastRevCommand);
        const lastRevHash : string = prom.stdout;
        if (lastRevHash === undefined || lastRevHash.length === 0) {
            throw "Revision of last commit wasn't determined.";
        }
        return lastRevHash.trim();
    }

    /**
     * This method uses the "git rev-list" command.
     */
    private async getFirstMonthRev() : Promise<string> {
        const date : Date = new Date();
        const getFirstMonthRevCommand : string = `git -C "${this._workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = await cp.exec(getFirstMonthRevCommand);
        let firstRevHash : string = prom.stdout;
        if (firstRevHash === undefined) {
            firstRevHash = "";
        }
        return firstRevHash.split("\n")[0];
    }
}
