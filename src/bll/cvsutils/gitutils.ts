"use strict";

import * as fs from "fs";
import * as path from "path";
import {workspace} from "vscode";
import * as cp from "child_process";
import {Logger} from "../utils/logger";
import * as cp_promise from "child-process-promise";

export class GitUtils {

    public static async getPath(): Promise<string> {
        const pathHint = workspace.getConfiguration("git").get<string>("path");
        try {
            return await this.findGitPath(pathHint);
        } catch (err) {
            throw new Error("git path not found");
        }
    }

    private static async findGitPath(hint: string | undefined): Promise<string> {
        const first = hint ? GitUtils.findSpecificGit(hint) : Promise.reject<string>(undefined);
        return first.then(void 0, () => {
            switch (process.platform) {
                case "darwin":
                    return GitUtils.findGitDarwin();
                case "win32":
                    return GitUtils.findGitWin32();
                default:
                    return GitUtils.findSpecificGit("git");
            }
        });
    }

    private static async findGitWin32(): Promise<string> {
        return GitUtils.findSpecificGit("git")
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramW6432"]))
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramFiles(x86)"]))
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramFiles"]))
            .then(void 0, () => GitUtils.findGitHubGitWin32());
    }

    private static async findSystemGitWin32(base: string): Promise<string> {
        if (!base) {
            return Promise.reject<string>("git not found");
        }

        return GitUtils.findSpecificGit(path.join(base, "Git", "cmd", "git.exe"));
    }

    private static async findGitHubGitWin32(): Promise<string> {
        const gitHub = path.join(process.env["LOCALAPPDATA"], "GitHub");

        const prom: Promise<string[]> = new Promise<string[]>((resolve, reject) => {
            fs.readdir(gitHub, (err, result) => err ? reject(err) : resolve(result));
        });

        return prom.then((children) => {
            const git = children.filter((child) => /^PortableGit/.test(child))[0];

            if (!git) {
                return Promise.reject<string>("git not found");
            }

            return GitUtils.findSpecificGit(path.join(gitHub, git, "cmd", "git.exe"));
        });
    }

    private static async findGitDarwin(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            cp.exec("which git", (err, gitPathBuffer) => {
                if (err) {
                    return reject("git not found");
                }

                const path = gitPathBuffer.toString().replace(/^\s+|\s+$/g, "");
                if (path !== "/usr/bin/git") {
                    return this.findSpecificGit(path);
                }

                // must check if XCode is installed
                cp.exec("xcode-select -p", (err: any) => {
                    if (err && err.code === 2) {
                        // git is not installed, and launching /usr/bin/git
                        // will prompt the user to install it

                        return reject("git not found");
                    }
                    this.findSpecificGit(path);
                });
            });
        });
    }

    private static async findSpecificGit(path: string): Promise<string> {
        const promiseResult = await cp_promise.exec(`"${path}" --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!versionCommandResult) {
            throw new Error("git not found");
        }
        return path;
    }

    private static async getVersion(path: string): Promise<string> {
        const promiseResult = await cp_promise.exec(`"${path}" --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        return GitUtils.parseVersion(versionCommandResult);
    }

    private static parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }

    public static async checkIsActive(path: string): Promise<void> {
        const version: string = await this.getVersion(path);
        this.checkVersion(version);
        await this.checkIsGitRepository(path);
        await this.checkStagedFilesPresence(path);
    }

    private static checkVersion(version: string): void {
        if (GitUtils.isFirstVersion(version)) {
            Logger.logWarning(`GitUtils#collectInfo: git ${version} installed. TeamCity extension requires git >= 2`);
            throw new Error(`You seem to have git ${version} installed. TeamCity extension requires git >= 2`);
        }
    }

    private static isFirstVersion(version: string): boolean {
        return /^[01]/.test(version);
    }

    private static async checkIsGitRepository(path: string): Promise<void> {
        const revParseCommand: string = `"${path}" -C "${workspace.rootPath}" rev-parse --show-toplevel`;
        Logger.logDebug(`GitUtils#collectInfo: revParseCommand is ${revParseCommand}`);
        try {
            await cp_promise.exec(revParseCommand);
        } catch (err) {
            throw new Error("Git repository was not determined");
        }
    }

    private static async checkStagedFilesPresence(path: string): Promise<void> {
        const gitDiffCommand: string = `"${path}" -C "${workspace.rootPath}" diff --name-only --staged`;
        Logger.logDebug(`GitUtils#collectInfo: gitDiffCommand is ${gitDiffCommand}`);
        const gitDiffOutput = await cp_promise.exec(gitDiffCommand);
        const diffResults: string = gitDiffOutput.stdout.toString("utf8").trim();
        const stagedFilesPresence: boolean = !!diffResults;
        if (!stagedFilesPresence) {
            throw new Error("There are no staged files in git");
        }
    }
}
