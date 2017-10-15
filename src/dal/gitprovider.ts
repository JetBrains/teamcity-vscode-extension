"use strict";

import * as path from "path";
import * as stream from "stream";
import * as cp from "child_process";
import * as fs_async from "async-file";
import {Logger} from "../bll/utils/logger";
import {CvsProviderTypes} from "../bll/utils/constants";
import {CvsSupportProvider} from "./cvsprovider";
import {VsCodeUtils} from "../bll/utils/vscodeutils";
import * as cp_promise from "child-process-promise";
import {QuickPickItem, QuickPickOptions, scm, Uri, window, workspace, WorkspaceFolder} from "vscode";
import {CvsLocalResource} from "../bll/entities/cvsresources/cvslocalresource";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {ReadableSet} from "../bll/utils/readableset";
import {GitPathFinder} from "../bll/cvsutils/gitpathfinder";
import {Finder} from "../bll/cvsutils/finder";
import {Validator} from "../bll/cvsutils/validator";
import {GitIsActiveValidator} from "../bll/cvsutils/gitisactivevalidator";
import {ModifiedCvsResource} from "../bll/entities/cvsresources/modifiedcvsresource";
import {AddedCvsResource} from "../bll/entities/cvsresources/addedcvsresource";
import {ReplacedCvsResource} from "../bll/entities/cvsresources/replacedcvsresource";
import {DeletedCvsResource} from "../bll/entities/cvsresources/deletedcvsresource";

export class GitSupportProvider implements CvsSupportProvider {

    private gitPath: string;
    private workspaceRootPath: string;
    private workspaceRootPathAsUri: Uri;

    private constructor(rootPath: Uri) {
        this.workspaceRootPathAsUri = rootPath;
        this.workspaceRootPath = rootPath.fsPath;
    }

    public static async tryActivateInPath(workspaceRootPath: Uri): Promise<CvsSupportProvider> {
        const instance: GitSupportProvider = new GitSupportProvider(workspaceRootPath);
        const pathFinder: Finder = new GitPathFinder();
        const gitPath: string = await pathFinder.find();
        const isActiveValidator: Validator = new GitIsActiveValidator(gitPath);
        await isActiveValidator.validate();
        instance.gitPath = gitPath;
        return instance;
    }

    public get cvsType(): CvsProviderTypes {
        return CvsProviderTypes.Git;
    }

    /**
     * Fill TeamCity Server Paths and
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public async getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]> {
        const cvsLocalResources: CvsLocalResource[] = checkInInfo.cvsLocalResources;
        const formattedChangedFiles = [];
        cvsLocalResources.forEach((localResource) => {
            formattedChangedFiles.push(localResource.serverFilePath);
        });
        return formattedChangedFiles;
    }

    /**
     * This method provides required info for provisioning remote run and post-commit execution.
     * (Only for git) In case of git there are no workItemIds
     * @return CheckInInfo object
     */
    public async getRequiredCheckInInfo(): Promise<CheckInInfo> {

        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: should init checkIn info`);
        const commitMessage: string = this.getCommitMessage();
        const cvsLocalResource: CvsLocalResource[] = await this.getLocalResources();
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: absPaths is ${cvsLocalResource ? " not" : ""}empty`);
        await this.fillInServerPaths(cvsLocalResource);

        const cvsProvider: CvsSupportProvider = this;
        return new CheckInInfo(commitMessage, cvsLocalResource, cvsProvider);
    }

    private getCommitMessage(): string {
        if (!scm || !scm.inputBox) {
            return "";
        }
        return scm.inputBox.value;
    }

    private async fillInServerPaths(cvsLocalResources: CvsLocalResource[]): Promise<void> {
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        const lastRevHash = await this.getLastRevision(remoteBranch);
        cvsLocalResources.forEach((localResource) => {
            const relativePath: string = localResource.fileAbsPath.replace(this.workspaceRootPath, "");
            localResource.serverFilePath = `jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`;
            if (localResource.prevFileAbsPath) {
                const relativePath: string = localResource.prevFileAbsPath.replace(this.workspaceRootPath, "");
                localResource.prevServerFilePath = `jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`;
            }
        });
    }

    /**
     * Commit all staged/changed (at the moment of a post-commit) files with new content.
     * Should user changes them since build config run, it works incorrect.
     * (Only for git) This functionality would work incorrect if user stages additional files since build config run.
     */
    public async requestForPostCommit(checkInInfo: CheckInInfo): Promise<void> {
        const choices: QuickPickItem[] = [];
        const GIT_COMMIT_PUSH_INTRO_MESSAGE = "Would you like to commit/push your changes?";
        const NO_LABEL: string = "No, thank you";
        const COMMIT_LABEL: string = "Commit (without Push)";
        const COMMIT_AND_PUSH_LABEL: string = "Commit and Push";
        choices.push({label: NO_LABEL, description: undefined});
        choices.push({label: COMMIT_LABEL, description: undefined});
        const remotes: GitRemote[] = await this.getRemotes();
        //Ask to push only when it's possible
        if (remotes && remotes.length > 0) {
            choices.push({label: COMMIT_AND_PUSH_LABEL, description: undefined});
        }

        const options: QuickPickOptions = {
            ignoreFocusOut: true,
            matchOnDescription: false,
            placeHolder: GIT_COMMIT_PUSH_INTRO_MESSAGE
        };
        const nextGitOperation: QuickPickItem = await window.showQuickPick(choices, options);
        Logger.logDebug(`GitSupportProvider#requestForPostCommit: nextGitOperation is ${nextGitOperation ? nextGitOperation.label : "undefined"}}`);
        if (nextGitOperation === undefined) {
            //Do nothing
        } else if (nextGitOperation.label === COMMIT_LABEL) {
            try {
                await this.commit(checkInInfo);
            } catch (err) {
                throw new Error(`(teamcity) An error occurrs during processing commit. Please try manually`);
            }
        } else if (nextGitOperation.label === COMMIT_AND_PUSH_LABEL) {
            try {
                await this.commit(checkInInfo);
                const pushCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" push"`;
                await cp_promise.exec(pushCommand);
            } catch (err) {
                throw new Error(`(teamcity) An error occurrs during processing commit/push. Please try manually`);
            }
        }
    }

    /**
     * For some CVSes staged files and files at the file system aren't the same.
     * If they are not the same this method @returns ReadStream with content of the specified file.
     * Otherwise this method @returns undefined and we can use a content of the file from the file system.
     */
    public async getStagedFileContentStream(cvsResource: CvsLocalResource): Promise<ReadableSet> {
        const fileAbsPath: string = cvsResource.fileAbsPath;
        const gitPath: string = this.gitPath;
        const relPath = path.relative(this.workspaceRootPath, cvsResource.fileAbsPath).replace(/\\/g, "/");
        const spawnArgs: string[] = [`-C`, `${this.workspaceRootPath}`, `show`, `:${relPath}`];
        const showFileStream: stream.Readable = cp.spawn(`${gitPath}`, spawnArgs).stdout;
        let streamLength: number = 0;
        return new Promise<ReadableSet>((resolve, reject) => {
            showFileStream.on("end", () => {
                Logger.logDebug(`GitSupportProvider#getStagedFileContentStream: stream for counting bytes of ${fileAbsPath} has ended. Total size is ${streamLength}`);
                // Get ReadStream for reading file content
                const showFileStream: stream.Readable = cp.spawn(`${gitPath}`, spawnArgs).stdout;
                resolve({stream: showFileStream, length: streamLength});
            });
            showFileStream.on("close", () => {
                Logger.logError(`GitSupportProvider#getStagedFileContentStream: Stream was closed before it ended`);
                reject("GitSupportProvider#getStagedFileContentStream: Stream was closed before it ended");
            });
            showFileStream.on("error", function (err) {
                Logger.logError(`GitSupportProvider#getStagedFileContentStream: stream for counting bytes of ${fileAbsPath} has ended exited with error ${VsCodeUtils.formatErrorMessage(err)}`);
                reject(err);
            });
            showFileStream.on("data", function (chunk) {
                streamLength += chunk.length;
            });
        });
    }

    /**
     * This method uses git "diff" command to get absolute paths of staged files and theirs changeTypes.
     * @return absolute paths of staged files and theirs changeTypes or [] if request was failed.
     */
    private async getLocalResources(): Promise<CvsLocalResource[]> {
        const localResources: CvsLocalResource[] = [];
        let porcelainStatusResult: any;

        try {
            const getPorcelainStatusCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" status --porcelain`;
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
        const porcelainStatusRows: string = porcelainStatusResult.stdout.toString("utf8").replace(/\s*$/, "");
        const porcelainGitRegExp: RegExp = /^([MADRC]).\s(.*)$/;
        const renamedGitRegExp: RegExp = /^(.*)->(.*)$/;
        const porcelainStatusRowsArray: string[] = porcelainStatusRows.split("\n");
        for (let i = 0; i < porcelainStatusRowsArray.length; i++) {
            const relativePath = porcelainStatusRowsArray[i];
            const parsedPorcelain: string[] = porcelainGitRegExp.exec(relativePath);
            if (!parsedPorcelain || parsedPorcelain.length !== 3) {
                return;
            }
            const fileStat: string = parsedPorcelain[1].trim();
            const fileRelativePath: string = parsedPorcelain[2].trim();
            let fileAbsPath: string = path.join(this.workspaceRootPath, parsedPorcelain[2].trim());
            let prevFileAbsPath: string;
            if (!fileAbsPath) {
                return;
            }
            switch (fileStat) {
                case "M": {
                    localResources.push(new ModifiedCvsResource(fileAbsPath, fileRelativePath));
                    break;
                }
                case "A": {
                    localResources.push(new AddedCvsResource(fileAbsPath, fileRelativePath));
                    break;
                }
                case "D": {
                    localResources.push(new DeletedCvsResource(fileAbsPath, fileRelativePath));
                    break;
                }
                case "R": {
                    const parsedRenamed: string[] | null = renamedGitRegExp.exec(fileAbsPath);
                    if (parsedRenamed && parsedRenamed.length === 3) {
                        prevFileAbsPath = path.join(parsedRenamed[1].trim(), ".");
                        fileAbsPath = path.join(this.workspaceRootPath, parsedRenamed[2].trim());
                        localResources.push(new ReplacedCvsResource(fileAbsPath, fileRelativePath, prevFileAbsPath));
                    }
                    break;
                }
                case "C": {
                    const parsedCopied: string[] | null = renamedGitRegExp.exec(parsedPorcelain[2]);
                    if (parsedCopied && parsedCopied.length === 3) {
                        fileAbsPath = path.join(this.workspaceRootPath, parsedCopied[2].trim());
                        localResources.push(new AddedCvsResource(fileAbsPath, fileRelativePath));
                    }
                    break;
                }
                default: {
                    const fileExists: boolean = await fs_async.exists(fileAbsPath);
                    if (fileExists) {
                        localResources.push(new ModifiedCvsResource(fileAbsPath, fileRelativePath));
                    } else {
                        localResources.push(new DeletedCvsResource(fileAbsPath, fileRelativePath));
                    }
                }
            }
        }
        Logger.logDebug(`GitSupportProvider#getLocalResources: ${localResources.length} changed resources was detected`);
        return localResources;
    }

    /**
     * This method uses the "git branch -vv" command
     */
    private async getRemoteBrunch(): Promise<string> {
        const getRemoteBranchCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" rev-parse --abbrev-ref --symbolic-full-name @{u}`;
        const prom = await cp_promise.exec(getRemoteBranchCommand);
        let remoteBranch: string = prom.stdout;
        if (remoteBranch === undefined || remoteBranch.length === 0) {
            Logger.logError(`GitSupportProvider#getRemoteBrunch: remote branch wasn't determined`);
            throw new Error("GitRemote branch wasn't determined");
        }
        remoteBranch = remoteBranch.replace(/'/g, "").trim();
        Logger.logDebug(`GitSupportProvider#getRemoteBrunch: remote branch is ${remoteBranch}`);
        return remoteBranch;
    }

    /**
     * IT IS NOT THE LATEST REVISION IN THE LOCAL REPO. This method returns the last compatible revision by the "git merge-base" command.
     */
    private async getLastRevision(remoteBranch): Promise<string> {
        const getLastRevCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
        const prom = await cp_promise.exec(getLastRevCommand);
        const lastRevHash: string = prom.stdout;
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
    private async getFirstMonthRev(): Promise<string> {
        const date: Date = new Date();
        const getFirstMonthRevCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" rev-list --reverse --since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = await cp_promise.exec(getFirstMonthRevCommand);
        let firstRevHash: string = prom.stdout;
        if (firstRevHash === undefined) {
            Logger.logWarning(`GitSupportProvider#firstRevHash: first month revision wasn't determined but it's still ok`);
            return "";
        }
        firstRevHash = firstRevHash.split("\n")[0];
        Logger.logDebug(`GitSupportProvider#firstRevHash: first month revision is ${firstRevHash}`);
        return firstRevHash;
    }

    private async getRemotes(): Promise<GitRemote[]> {
        const getRemotesCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" remote --verbose`;
        const getRemotesOutput = await cp_promise.exec(getRemotesCommand);
        const regex = /^([^\s]+)\s+([^\s]+)\s/;
        const rawRemotes = getRemotesOutput.stdout.trim().split("\n")
            .filter((b) => !!b)
            .map((line) => regex.exec(line))
            .filter((g) => !!g)
            .map((groups: RegExpExecArray) => ({name: groups[1], url: groups[2]}));

        return VsCodeUtils.uniqBy(rawRemotes, (remote) => remote.name);
    }

    private async commit(checkInInfo: CheckInInfo): Promise<void> {
        const commitCommandBuilder: string[] = [];
        commitCommandBuilder.push(`"${this.gitPath}" -C "${this.workspaceRootPath}" commit -m "${checkInInfo.message}" --quiet --allow-empty-message`);
        checkInInfo.cvsLocalResources.forEach((cvsLocalResource) => {
            commitCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
            if (cvsLocalResource.prevFileAbsPath) {
                commitCommandBuilder.push(`"${cvsLocalResource.prevFileAbsPath}"`);
            }
        });
        try {
            await cp_promise.exec(commitCommandBuilder.join(" "));
        } catch (err) {
            if (err.stderr && err.stderr.indexOf("Please tell me who you are.") !== -1) {
                Logger.logError(`GitSupportProvider#commit: Unable to auto-detect email address for ${this.gitPath}. ` +
                    `Run  git config --global user.email "you@example.com"  git config --global user.name "Your Name" ` +
                    `to set your account's default identity. ${VsCodeUtils.formatErrorMessage(err)}`);
                throw new Error(`Unable to auto-detect email address for ${this.gitPath}`);
            }
            throw err;
        }
    }

    public getRootPath(): string {
        return this.workspaceRootPathAsUri.path;
    }

    public allowStaging(): boolean {
        return true;
    }
}

interface GitRemote {
    name: string;
    url: string;
}
