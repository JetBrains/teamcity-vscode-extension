import * as path from "path";
import * as stream from "stream";
import * as cp from "child_process";
import {Logger} from "../bll/utils/logger";
import {CvsSupportProvider} from "./cvsprovider";
import * as cp_promise from "child-process-promise";
import {CvsResource} from "../bll/entities/cvsresources/cvsresource";
import {CheckInInfo} from "../bll/entities/checkininfo";
import {ReadableSet} from "../bll/utils/readableset";
import {Utils} from "../bll/utils/utils";
import {UriProxy} from "../bll/moduleproxies/uri-proxy";
import {Uri} from "vscode";
import {GitStatusCommand} from "./git/GitStatusCommand";
import {GitCommandsFactory} from "./git/GitCommandsFactory";

export class GitProvider implements CvsSupportProvider {

    private readonly workspaceRootPath: string;
    private commandFactory: GitCommandsFactory;

    public constructor(private readonly workspaceRootPathAsUri: UriProxy | Uri,
                       private readonly gitPath: string,
                       commandFactory: GitCommandsFactory) {
        this.workspaceRootPath = workspaceRootPathAsUri.fsPath;
        this.commandFactory = commandFactory;
    }

    public async getFormattedFileNames(checkInInfo: CheckInInfo): Promise<string[]> {
        const cvsLocalResources: CvsResource[] = checkInInfo.cvsLocalResources;
        const formattedChangedFiles = [];
        cvsLocalResources.forEach((localResource) => {
            formattedChangedFiles.push(localResource.serverFilePath);
        });
        return formattedChangedFiles;
    }

    public async getRequiredCheckInInfo(): Promise<CheckInInfo> {
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo: should init checkIn info`);
        const cvsLocalResources: CvsResource[] = await this.getChanges(this.workspaceRootPath, this.gitPath);
        Logger.logDebug(`GitSupportProvider#getRequiredCheckinInfo:absPaths is ${cvsLocalResources ? "not " : ""}empty`);
        await this.fillInServerPaths(cvsLocalResources);

        const cvsProvider: CvsSupportProvider = this;
        return new CheckInInfo(cvsLocalResources, cvsProvider);
    }

    private async getChanges(workspaceRootPath: string, gitPath: string): Promise<CvsResource[]> {
        const statusCommand: GitStatusCommand = this.commandFactory.getStatusCommand(workspaceRootPath, gitPath, true);
        return statusCommand.execute();
    }

    private async fillInServerPaths(cvsLocalResources: CvsResource[]): Promise<void> {
        const remoteBranch = await this.getRemoteBrunch();
        let firstMonthRevHash = await this.getFirstMonthRev();
        firstMonthRevHash = firstMonthRevHash ? firstMonthRevHash + "-" : "";
        const lastRevHash = await this.getLastCompatibleMergeBaseRevision(remoteBranch);
        cvsLocalResources.forEach((localResource) => {
            const relativePath: string = localResource.fileAbsPath.replace(this.workspaceRootPath, "");
            localResource.serverFilePath = `jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relativePath}`;
            if (localResource.prevFileAbsPath) {
                const relPath: string = localResource.prevFileAbsPath.replace(this.workspaceRootPath, "");
                localResource.prevServerFilePath = `jetbrains.git://${firstMonthRevHash}${lastRevHash}||${relPath}`;
            }
        });
    }

    private async getRemoteBrunch(): Promise<string> {
        const getRemoteBranchCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" ` +
                                                 `rev-parse --abbrev-ref --symbolic-full-name @{u}`;
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

    private async getFirstMonthRev(): Promise<string> {
        const date: Date = new Date();
        const getFirstMonthRevCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" rev-list --reverse ` +
                                                        `--since="${date.getFullYear()}.${date.getMonth() + 1}.1" HEAD`;
        const prom = await cp_promise.exec(getFirstMonthRevCommand);
        let firstRevHash: string = prom.stdout;
        if (firstRevHash === undefined) {
            Logger.logWarning(`GitSupportProvider#firstRevHash: first month revision wasn't determined.`);
            return "";
        }
        firstRevHash = firstRevHash.split("\n")[0];
        Logger.logDebug(`GitSupportProvider#firstRevHash: first month revision is ${firstRevHash}`);
        return firstRevHash;
    }

    private async getLastCompatibleMergeBaseRevision(remoteBranch): Promise<string> {
        const getLastRev: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" merge-base HEAD ${remoteBranch}`;
        const prom = await cp_promise.exec(getLastRev);
        const lastRevHash: string = prom.stdout;
        if (lastRevHash === undefined || lastRevHash.length === 0) {
            Logger.logError(`GitSupportProvider#getLastCompatibleMergeBaseRevision: ` +
                                                        `revision of last commit wasn't determined`);
            throw new Error("Revision of last commit wasn't determined.");
        }
        Logger.logDebug(`GitSupportProvider#getLastCompatibleMergeBaseRevision: last ` +
                                                           `merge-based revision is ${lastRevHash}`);
        return lastRevHash.trim();
    }

    public async getStagedFileContentStream(cvsResource: CvsResource): Promise<ReadableSet> {
        const streamLength: number = await this.getStagedFileContentLength(cvsResource);
        const relativePath = this.getNormalizedRelativePath(cvsResource);

        const showFileStreamCommandOptions: string[] = [`-C`, `${this.workspaceRootPath}`, `show`, `:${relativePath}`];
        const showFileStream: stream.Readable = cp.spawn(`${this.gitPath}`, showFileStreamCommandOptions).stdout;

        return {stream: showFileStream, length: streamLength};
    }

    private async getStagedFileContentLength(cvsResource: CvsResource): Promise<number> {
        const relativePath = this.getNormalizedRelativePath(cvsResource);
        const showFileStreamCommandOptions: string[] = [`-C`, `${this.workspaceRootPath}`, `show`, `:${relativePath}`];
        const showFileStream: stream.Readable = cp.spawn(`${this.gitPath}`, showFileStreamCommandOptions).stdout;
        let streamLength: number = 0;
        return new Promise<number>((resolve, reject) => {
            showFileStream.on("end", () => {
                Logger.logDebug(`GitSupportProvider#getStagedFileContentLength: stream for counting ` +
                    `bytes of ${cvsResource.fileAbsPath} has ended. Total size is ${streamLength}`);
                resolve(streamLength);
            });
            showFileStream.on("close", () => {
                Logger.logError(`GitSupportProvider#getStagedFileContentLength: Stream was closed before it ended`);
                reject("GitProvider#getStagedFileContentLength: Stream was closed before it ended");
            });
            showFileStream.on("error", function (err) {
                Logger.logError(`GitSupportProvider#getStagedFileContentLength: stream for counting ` +
                    `bytes of ${cvsResource.fileAbsPath} has ended exited with error ${Utils.formatErrorMessage(err)}`);
                reject(err);
            });
            showFileStream.on("data", function (chunk) {
                streamLength += chunk.length;
            });
        });
    }

    private getNormalizedRelativePath(cvsResource: CvsResource) {
        const notNormalizedRelativePath: string = path.relative(this.workspaceRootPath, cvsResource.fileAbsPath);
        return notNormalizedRelativePath.replace(/\\/g, "/");
    }

    public async commit(checkInInfo: CheckInInfo): Promise<void> {
        const commitCommandBuilder: string[] = [];
        commitCommandBuilder.push(`"${this.gitPath}" -C "${this.workspaceRootPath}" commit ` +
                                        `-m "${checkInInfo.message}" --quiet --allow-empty-message`);
        checkInInfo.cvsLocalResources.forEach((cvsLocalResource) => {
            commitCommandBuilder.push(`"${cvsLocalResource.fileAbsPath}"`);
            if (cvsLocalResource.prevFileAbsPath) {
                commitCommandBuilder.push(`"${cvsLocalResource.prevFileAbsPath}"`);
            }
        });
        try {
            await cp_promise.exec(commitCommandBuilder.join(" "));
        } catch (err) {
            Logger.logError(`GitProvider#commit: ${err}`);
            if (err.stderr && err.stderr.indexOf("Please tell me who you are.") !== -1) {
                Logger.logError(`GitSupportProvider#commit: Unable to auto-detect email address for ${this.gitPath}. ` +
                    `Run  git config --global user.email "you@example.com"  git config --global user.name "Your Name"` +
                    ` to set your account's default identity. ${Utils.formatErrorMessage(err)}`);
                throw new Error(`Unable to auto-detect email address for ${this.gitPath}`);
            }
            throw err;
        }
    }

    public async commitAndPush(checkInInfo: CheckInInfo): Promise<void> {
        await this.commit(checkInInfo);
        if (await this.remotesExist()) {
            const pushCommand: string = `"${this.gitPath}" -C "${this.workspaceRootPath}" push"`;
            await cp_promise.exec(pushCommand);
        } else {
            Logger.logWarning("[GitProvider::commitAndPush] there are no remotes to push into");
        }
    }

    private async remotesExist(): Promise<boolean> {
        const gitRemotes: GitRemote[] = await this.getRemotes();
        return gitRemotes && gitRemotes.length > 0;
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

        return Utils.uniqBy(rawRemotes, (remote) => remote.name);
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
