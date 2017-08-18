"use strict";

import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import * as cp from "child_process";
import { Logger } from "../utils/logger";
import { CvsSupportProvider } from "./cvsprovider";
import { VsCodeUtils } from "../utils/vscodeutils";
import * as cp_promise from "child-process-promise";
import { PatchManager } from "../utils/patchmanager";
import { CvsFileStatusCode } from "../utils/constants";
import { CvsLocalResource } from "../entities/leaveitems";
import { workspace, scm, QuickPickItem, QuickPickOptions, window } from "vscode";
import { CheckinInfo, Remote, MappingFileContent, ReadableSet } from "../utils/interfaces";

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
        const cvsLocalResources : CvsLocalResource[] = this._checkinInfo.cvsLocalResources;
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        const lastRevHash = await this.getLastRevision(remoteBranch);
        const formatedChangedFiles = [];
        cvsLocalResources.forEach((localResource) => {
            const relativePath : string = localResource.fileAbsPath.replace(this._workspaceRootPath, "");
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
        const commandResult = await cp_promise.exec(getRemoteUrlCommand);
        const remoteUrl : string = commandResult.stdout;
        if (remoteUrl === undefined || remoteUrl.length === 0) {
            Logger.logError(`GitSupportProvider#generateConfigFileContent: Remote url wasn't determined`);
            throw new Error("Remote url wasn't determined");
        }
        const configFileContent : MappingFileContent = {
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
        const commitMessage: string = scm.inputBox.value;
        const cvsLocalResource : CvsLocalResource[] = await this.getLocalResources();
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: absPaths is ${cvsLocalResource ? " not" : ""}empty`);
        return {
            cvsLocalResources: cvsLocalResource,
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
    public async requestForPostCommit(patchAbsPath : string) : Promise<void> {
        const choices: QuickPickItem[] = [];
        const GIT_COMMIT_PUSH_INTRO_MESSAGE = "Would you like to commit/push your changes?";
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
            this.executePostCommit(patchAbsPath);
        } else if (nextGitOperation.label === COMMIT_AND_PUSH_LABEL) {
            this.executePostCommit(patchAbsPath);
            const pushCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" push"`;
            await cp_promise.exec(pushCommand);
        }
    }

    /**
     * Sets files for remote run, when user wants to provide them manually.
     */
    public setFilesForRemoteRun(resources : CvsLocalResource[]) {
        this._checkinInfo.cvsLocalResources = resources;
    }

    /**
     * For some CVSes staged files and files at the file system aren't the same.
     * If they are not the same this method @returns ReadStream with content of the specified file.
     * Otherwise this method @returns undefind and we can use a content of the file from the file system.
     */
    public async showFile(fileAbsPath : string) : Promise<ReadableSet> {
        const relPath = path.relative(this._workspaceRootPath, fileAbsPath).replace(/\\/g, "/");
        const showFileCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" show :"${relPath}"`;
        const showFileStream : stream.Readable = cp.exec(showFileCommand).stdout;
        let streamLength : number = 0;
        const prom : Promise<ReadableSet> = new Promise((resolve, reject) => {
            showFileStream.on("end", function () {
                Logger.logDebug(`GitSupportProvider#showFile: stream for counting bytes of ${fileAbsPath} has ended. Total size is ${streamLength}`);
                const showFileStream : stream.Readable = cp.exec(showFileCommand).stdout;
                resolve({stream: showFileStream, length: streamLength});
            });
            showFileStream.on("error", function (err) {
                Logger.logError(`GitSupportProvider#showFile: stream for counting bytes of ${fileAbsPath} has ended exited with error ${VsCodeUtils.formatErrorMessage(err)}`);
                reject(err);
            });
            showFileStream.on("data", function(chunk) {
                streamLength += chunk.length;
            });
        });
        return prom;
    }

    /**
     * This method uses git "diff" command to get absolute paths of staged files and theirs changeTypes.
     * @return absolute paths of staged files and theirs changeTypes or [] if requiest was failed.
     */
    private async getLocalResources() : Promise<CvsLocalResource[]> {
        const localResources : CvsLocalResource[] = [];
        let porcelainStatusResult : any;

        try {
            const getPorcelainStatusCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" status --porcelain`;
            porcelainStatusResult = await cp_promise.exec(getPorcelainStatusCommand);
        } catch (err) {
            Logger.logWarning(`GitSupportProvider#getLocalResources: git status leads to the error: ${VsCodeUtils.formatErrorMessage(err)}`);
            return [];
        }

        if (!porcelainStatusResult || !porcelainStatusResult.stdout) {
            Logger.logDebug(`GitSupportProvider#getLocalResources: git status didn't find staged files`);
            return [];
        }
        //We should trim only end of the line, first space chars are meaningful
        const porcelainStatusRows : string = porcelainStatusResult.stdout.toString("utf8").replace(/\s*$/, "");
        const porcelainGitRegExp : RegExp = /^([MADRC]).\s(.*)$/;
        const renamedGitRegExp : RegExp = /^(.*)->(.*)$/;
        porcelainStatusRows.split("\n").forEach((relativePath) => {
            const parsedPorcelain : string[] = porcelainGitRegExp.exec(relativePath);
            if (!parsedPorcelain || parsedPorcelain.length !== 3) {
                return;
            }
            const fileStat : string  = parsedPorcelain[1].trim();
            const fileRelativePath : string  = parsedPorcelain[2].trim();
            let fileAbsPath : string  = path.join(this._workspaceRootPath, parsedPorcelain[2].trim());
            let status : CvsFileStatusCode;
            let prevFileAbsPath : string;
            switch (fileStat) {
                case "M":{
                    status = CvsFileStatusCode.MODIFIED;
                    break;
                }
                case "A":{
                    status = CvsFileStatusCode.ADDED;
                    break;
                }
                case "D":{
                    status = CvsFileStatusCode.DELETED;
                    break;
                }
                case "R":{
                    const parsedRenamed : string[] | null = renamedGitRegExp.exec(fileAbsPath);
                    if (parsedRenamed && parsedRenamed.length === 3) {
                        prevFileAbsPath = path.join(parsedRenamed[1].trim(), ".");
                        fileAbsPath = path.join(this._workspaceRootPath, parsedRenamed[2].trim());
                        status = CvsFileStatusCode.RENAMED;
                    }
                    break;
                }
                case "C":{
                    const parsedCopied : string[] | null = renamedGitRegExp.exec(parsedPorcelain[2]);
                    if (parsedCopied && parsedCopied.length === 3) {
                        fileAbsPath = path.join(this._workspaceRootPath, parsedCopied[2].trim());
                        status = CvsFileStatusCode.ADDED;
                    }
                    break;
                }
            }
            if (status && fileAbsPath) {
                localResources.push(new CvsLocalResource(status, fileAbsPath, fileRelativePath /*label*/, prevFileAbsPath));
            }

        });
        Logger.logDebug(`GitSupportProvider#getLocalResources: ${localResources.length} changed resources was detected`);
        return localResources;
    }

    /**
     * This method uses the "git branch -vv" command
     */
    private async getRemoteBrunch() : Promise<string> {
        const getRemoteBranchCommand : string = `"${this._gitPath}" -C "${this._workspaceRootPath}" branch -vv --format='%(upstream:short)'`;
        const prom = await cp_promise.exec(getRemoteBranchCommand);
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
        const prom = await cp_promise.exec(getLastRevCommand);
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
        const prom = await cp_promise.exec(getFirstMonthRevCommand);
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
        const getRemotesOutput = await cp_promise.exec(getRemotesCommand);
        const regex = /^([^\s]+)\s+([^\s]+)\s/;
        const rawRemotes = getRemotesOutput.stdout.trim().split("\n")
            .filter((b) => !!b)
            .map((line) => regex.exec(line))
            .filter((g) => !!g)
            .map((groups: RegExpExecArray) => ({ name: groups[1], url: groups[2] }));

        return VsCodeUtils.uniqBy(rawRemotes, (remote) => remote.name);
    }

    /**
     * Build a commit command for child_process from the particular names of files, which were sent for a remote run.
     */
    private async executePostCommit(patchAbsPath : string) {
        const mappingFileContent : MappingFileContent =  await this.generateMappingFileContent();
        let currentStagedStatePatchAbsPath : string;
        let currentStatePatchAbsPath : string;
        try {
            /* Store current files contents */
            currentStagedStatePatchAbsPath = await PatchManager.preparePatch(this, mappingFileContent, true);
            currentStatePatchAbsPath = await PatchManager.preparePatch(this, mappingFileContent, false);
        } catch (err) {
            Logger.logError(`GitSupportProvider#executePostCommit: caught an exception during storing current state: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error("Caught an exception during storing current state");
        }
        try {
            /* Restore previous files contents */
            VsCodeUtils.showWarningMessage("Post-commit is processing. Please wait.");
            const cvsLocalResources : CvsLocalResource[] = await PatchManager.applyPatch(patchAbsPath, mappingFileContent);
            /* Add all the file to staged */
            const addCommandBuilder : string[] = [];
            const rmCommandBuilder : string[] = [];
            addCommandBuilder.push(`"${this._gitPath}" -C "${this._workspaceRootPath}" add -A --ignore-errors --`);
            rmCommandBuilder.push(`"${this._gitPath}" -C "${this._workspaceRootPath}" rm --cached --`);
            cvsLocalResources.forEach((cvsLocalResource) => {
                if (cvsLocalResource.status !== CvsFileStatusCode.DELETED) {
                    addCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
                } else {
                    rmCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
                }
            });
            try {
                await cp_promise.exec(addCommandBuilder.join(" "));
                await cp_promise.exec(rmCommandBuilder.join(" "));
            } catch (err) {
                Logger.logWarning(`GitSupportProvider#executePostCommit: an error occurs during git add command but it could be ok ${VsCodeUtils.formatErrorMessage(err)}`);
            }
            /* Commit all the files */
            const commitCommandBuilder : string[] = [];
            commitCommandBuilder.push(`"${this._gitPath}" -C "${this._workspaceRootPath}" commit -m "${this._checkinInfo.message}" --quiet --allow-empty-message`);
            cvsLocalResources.forEach((cvsLocalResource) => {
                commitCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
            });
            await cp_promise.exec(commitCommandBuilder.join(" "));
        } catch (err) {
            Logger.logError(`GitSupportProvider#executePostCommit: caught an exception during processing post-commit functionality: ${VsCodeUtils.formatErrorMessage(err)}`);
            throw new Error("Caught an exception during processing post-commit functionality");
        } finally {
            try {
                /* Restore current files contents */
                const currentCvsLocalResources : CvsLocalResource[] = await PatchManager.applyPatch(currentStagedStatePatchAbsPath, mappingFileContent);
                /* Add all the file to staged */
                const addCommandBuilder : string[] = [];
                const rmCommandBuilder : string[] = [];
                addCommandBuilder.push(`"${this._gitPath}" -C "${this._workspaceRootPath}" add -A --ignore-errors --`);
                rmCommandBuilder.push(`"${this._gitPath}" -C "${this._workspaceRootPath}" rm --cached --`);
                currentCvsLocalResources.forEach((cvsLocalResource) => {
                    if (cvsLocalResource.status !== CvsFileStatusCode.DELETED) {
                        addCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
                    } else {
                        rmCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
                    }
                });
                try {
                    await cp_promise.exec(addCommandBuilder.join(" "));
                    await cp_promise.exec(rmCommandBuilder.join(" "));
                } catch (err) {
                    Logger.logWarning(`GitSupportProvider#executePostCommit: an error occurs during git add command but it could be ok ${VsCodeUtils.formatErrorMessage(err)}`);
                }
                await PatchManager.applyPatch(currentStatePatchAbsPath, mappingFileContent);
            } catch (err) {
                Logger.logError(`TfsSupportProvider#requestForPostCommit: caught an exception during restoring current state: ${VsCodeUtils.formatErrorMessage(err)}`);
                throw new Error("Caught an exception during restoring current state");
            }
        }
        VsCodeUtils.showInfoMessage("Post-commit is successfully executed!");
        Logger.logInfo(`TfsSupportProvider#requestForPostCommit: post commit was executed`);
    }
}
