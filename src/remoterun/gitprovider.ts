"use strict";

import { workspace, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { CvsSupportProvider } from "./cvsprovider";
import { CheckinInfo, Remote, MappingFileContent } from "../utils/interfaces";
import { VsCodeUtils } from "../utils/vscodeutils";
import { Logger } from "../utils/logger";
import * as cp from "child-process-promise";
import * as path from "path";

/**
 * This implementation of CvsSupportProvider uses git command line. So git should be in the user classpath.
 */
export class GitSupportProvider implements CvsSupportProvider {
    private readonly _workspaceRootPath : string;
    private _checkinInfo : CheckinInfo;
    private _gitPath : string;

    public constructor(gitPath : string) {
        this._workspaceRootPath = workspace.rootPath;
        this._gitPath = gitPath;
    }

    public async init() {
        this._checkinInfo = await this.getRequiredCheckinInfo();
    }

    /**
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFilenames() : Promise<string[]> {
        const absPaths : string[] = this._checkinInfo.fileAbsPaths;
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        const lastRevHash = await this.getLastRevision(remoteBranch);
        const formatedChangedFiles = [];
        absPaths.forEach((absolutePath) => {
            const relativePath : string = absolutePath.replace(this._workspaceRootPath, "");
            const formatedFilePath = `jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`;
            formatedChangedFiles.push(formatedFilePath);
            Logger.logDebug(`GitSupportProvider#getFormattedFilenames: formatedFilePath: ${formatedFilePath}`);
        });
        return formatedChangedFiles;
    }

    /**
     * This method generates content of the ".teamcity-mappings.properties" file to map local changes to remote.
     * @return content of the ".teamcity-mappings.properties" file
     * (for git only) Currently @username part of content was removed. TODO: understand what is it and for which purpose is it used.
     */
    public async generateMappingFileContent() : Promise<MappingFileContent> {
        const getRemoteUrlCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" ls-remote --get-url`;
        Logger.logDebug(`GitSupportProvider#generateConfigFileContent: getRemoteUrlCommand: ${getRemoteUrlCommand}`);
        const commandResult = await cp.exec(getRemoteUrlCommand);
        const remoteUrl : string = commandResult.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0) {
            Logger.logError(`GitSupportProvider#generateConfigFileContent: Remote url wasn't determined`);
            throw new Error("Remote url wasn't determined");
        }
        //const configFileContent : string = `${this._workspaceRootPath}=jetbrains.git://|${remoteUrl.trim()}|`;
        const configFileContent : MappingFileContent =  {
            localRootPath: this._workspaceRootPath,
            tcProjectRootPath: `jetbrains.git://|${remoteUrl.trim()}|`,
            fullContent: `${this._workspaceRootPath}=jetbrains.git://|${remoteUrl.trim()}|`
        };
        Logger.logDebug(`GitSupportProvider#generateConfigFileContent: configFileContent: ${configFileContent.fullContent}`);
        return configFileContent;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Obly for git) In case of git there are no workItemIds
     * @return CheckinInfo object
     */
    public async getRequiredCheckinInfo() : Promise<CheckinInfo> {
        if (this._checkinInfo) {
            Logger.logInfo(`GitSupportProvider#getRequiredCheckinInfo: checkin info already exists`);
            return this._checkinInfo;
        }
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: should init checkin info`);
        //Git extension bug: If commit message is empty git won't commit anything
        const commitMessage: string = scm.inputBox.value === "" ? "-" : scm.inputBox.value;
        const absPaths : string[] = await this.getAbsPaths();
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: absPaths is ${absPaths ? " not" : ""}empty`);
        return {
            fileAbsPaths: absPaths,
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
    public async requestForPostCommit() : Promise<void> {
        const choices: QuickPickItem[] = [];
        const GIT_COMMIT_PUSH_INTRO_MESSAGE = "Whould you like to commit/push your changes?";
        const NO_LABEL : string = "No, thank you";
        const COMMIT_LABEL : string = "Commit (without Push)";
        const COMMIT_AND_PUSH_LABEL : string = "Commit and Push";
        choices.push({ label: NO_LABEL, description: undefined });
        choices.push({ label: COMMIT_LABEL, description: undefined });
        const remotes : Remote[] = await this.getRemotes();
        //Ask to push only when it's possible
        if (remotes && remotes.length > 0) {
            choices.push({ label: COMMIT_AND_PUSH_LABEL, description: undefined });
        }

        const options : QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: GIT_COMMIT_PUSH_INTRO_MESSAGE
        };
        const nextGitOperation : QuickPickItem = await window.showQuickPick(choices, options);
        Logger.logDebug(`GitSupportProvider#requestForPostCommit: nextGitOperation is ${nextGitOperation ? nextGitOperation.label : "undefined"}}`);
        if (nextGitOperation === undefined) {
            //Do nothing
        } else if (nextGitOperation.label === COMMIT_LABEL) {
            const commitCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" commit -m "${this._checkinInfo.message}"`;
            await cp.exec(commitCommand);
        } else if (nextGitOperation.label === COMMIT_AND_PUSH_LABEL) {
            const commitCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" commit -m "${this._checkinInfo.message}"`;
            await cp.exec(commitCommand);
            const pushCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" push"`;
            await cp.exec(pushCommand);
        }
    }

    /**
     * This method uses git extension api to get absolute paths of staged files.
     * @return absolute paths of staged files or [] if requiest was failed.
     */
    private async getAbsPaths() : Promise<string[]> {
        try {
            const absPaths : string[] = [];
            const getStagedFilesCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" diff --name-only --staged`;
            const commandResult = await cp.exec(getStagedFilesCommand);
            if (!commandResult.stdout) {
                Logger.logDebug(`GitSupportProvider#getAbsPaths: git diff didn't find staged files`);
                return [];
            }
            const stagedFilesRelarivePaths : string = commandResult.stdout.toString("utf8").trim();
            stagedFilesRelarivePaths.split("\n").forEach((relativePath) => {
                absPaths.push(path.join(this._workspaceRootPath, relativePath));
            });
            return absPaths;
        }catch (err) {
            Logger.logWarning(`GitSupportProvider#getAbsPaths: git diff leads to error: ${err}`);
            return [];
        }
    }

    /**
     * This method uses the "git branch -vv" command
     */
    private async getRemoteBrunch() : Promise<string> {
        const getRemoteBranchCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = await cp.exec(getRemoteBranchCommand);
        let remoteBranch : string = prom.stdout;
        if (remoteBranch === undefined || remoteBranch.length === 0) {
            Logger.logError(`GitSupportProvider#getRemoteBrunch: remote branch wasn't determined`);
            throw new Error("Remote branch wasn't determined");
        }
        remoteBranch = remoteBranch.replace(/'/g, "").trim();
        Logger.logDebug(`GitSupportProvider#getRemoteBrunch: remote branch is ${remoteBranch}`);
        return remoteBranch;
    }

    /**
     * IT IS NOT THE LATEST REVISION IN THE LOCAL REPO. This method returns the last compatible revision by the "git merge-base" command.
     */
    private async getLastRevision(remoteBranch) : Promise<string> {
        const getLastRevCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
        const prom = await cp.exec(getLastRevCommand);
        const lastRevHash : string = prom.stdout;
        if (lastRevHash === undefined || lastRevHash.length === 0) {
            Logger.logError(`GitSupportProvider#getLastRevision: revision of last commit wasn't determined`);
            throw new Error("Revision of last commit wasn't determined.");
        }
        Logger.logDebug(`GitSupportProvider#getLastRevision: last merge-based revision is ${lastRevHash}`);
        return lastRevHash.trim();
    }

    /**
     * This method uses the "git rev-list" command.
     */
    private async getFirstMonthRev() : Promise<string> {
        const date : Date = new Date();
        const getFirstMonthRevCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = await cp.exec(getFirstMonthRevCommand);
        let firstRevHash : string = prom.stdout;
        if (firstRevHash === undefined) {
            Logger.logWarning(`GitSupportProvider#firstRevHash: first month revision wasn't determinedm but it's still ok`);
            return "";
        }
        firstRevHash = firstRevHash.split("\n")[0];
        Logger.logDebug(`GitSupportProvider#firstRevHash: first month revision is ${firstRevHash}`);
        return firstRevHash;
    }

    private async getRemotes() : Promise<Remote[]> {
        const getRemotesCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" remote --verbose`;
        const getRemotesOutput = await cp.exec(getRemotesCommand);
        const regex = /^([^\s]+)\s+([^\s]+)\s/;
        const rawRemotes = getRemotesOutput.stdout.trim().split("\n")
            .filter((b) => !!b)
            .map((line) => regex.exec(line))
            .filter((g) => !!g)
            .map((groups: RegExpExecArray) => ({ name: groups[1], url: groups[2] }));

        return VsCodeUtils.uniqBy(rawRemotes, (remote) => remote.name);
    }
}
