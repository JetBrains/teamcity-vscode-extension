"use strict";

import * as fs from "fs";
import * as path from "path";
import {workspace} from "vscode";
import * as cp from "child_process";
import {Logger} from "./logger";
import {VsCodeUtils} from "./vscodeutils";
import * as cp_promise from "child-process-promise";
import {CvsProviderTypes} from "./constants";
import {CvsInfo} from "../interfaces/CvsInfo";
import {CvsPartialInfo} from "../interfaces/cvspartiaiInfo";

export class GitUtils {

    /**
     * This method allows to detect git path and collect info about problems related to the git cvs.
     * @return CvsInfo object
     * #cvsType: git;
     * #path: detected git path, path is undefined when git path was not found;
     * #versionErrorMsg: is undefined if version is compatible, else a message witch contains about current and required versions;
     * #isChanged: is true if there are some changes / is false if there are no changes / is undefined if it's not a git repo
     */
    public static async collectInfo(): Promise<CvsInfo> {
        const cvsInfo: CvsInfo = {
            cvsType: CvsProviderTypes.Git,
            path: undefined,
            versionErrorMsg: undefined,
            isChanged: undefined
        };
        try {
            const pathHint = workspace.getConfiguration("git").get<string>("path");
            Logger.logDebug(`GitUtils#collectInfo: pathHint is ${pathHint}`);
            /*If there is no git the command will generate the "command is not recognized" exception and
             the code will go to the finally block
             */
            const partialInfo: CvsPartialInfo = await GitUtils.findGit(pathHint);
            Logger.logInfo(`GitUtils#collectInfo: detected gitPath is ${partialInfo.path}, version is ${partialInfo.version}`);
            cvsInfo.path = partialInfo.path;

            if (/^[01]/.test(partialInfo.version)) {
                Logger.logWarning(`GitUtils#collectInfo: git ${partialInfo.version} installed. TeamCity extension requires git >= 2`);
                cvsInfo.versionErrorMsg = `You seem to have git ${partialInfo.version} installed. TeamCity extension requires git >= 2`;
                return cvsInfo;
            }

            /* There are three possible cases here:
             * It is not a git repository -> command will generate the "Not a git repository" exception :: isChanged = undefined
             * It is a git repo but there are no changes here -> command will return empty stdout :: isChanged = false
             * It is a git repo and there are some changes here -> command will return not empty stdout :: isChanged = true
             */
            const gitDiffCommand: string = `"${partialInfo.path}" -C "${workspace.rootPath}" diff --name-only --staged`;
            Logger.logDebug(`GitUtils#collectInfo: gitDiffCommand is ${gitDiffCommand}`);

            const gitDiffOutput = await cp_promise.exec(gitDiffCommand);
            const diffResults: string = gitDiffOutput.stdout.toString("utf8").trim();
            cvsInfo.isChanged = !!diffResults;
        } catch (err) {
            Logger.logWarning(`GitUtils#collectInfo:  ${VsCodeUtils.formatErrorMessage(err)}`);
        } finally {
            Logger.logDebug(`GitUtils#collectInfo: path: ${cvsInfo.path},
                versionErrMsg: ${cvsInfo.versionErrorMsg},
                changed: ${cvsInfo.isChanged}`);
        }
        return cvsInfo;
    }

    private static async findGit(hint: string | undefined): Promise<CvsPartialInfo> {
        const first = hint ? GitUtils.findSpecificGit(hint) : Promise.reject<CvsPartialInfo>(undefined);
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

    private static async findGitWin32(): Promise<CvsPartialInfo> {
        return GitUtils.findSpecificGit("git")
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramW6432"]))
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramFiles(x86)"]))
            .then(void 0, () => GitUtils.findSystemGitWin32(process.env["ProgramFiles"]))
            .then(void 0, () => GitUtils.findGitHubGitWin32());
    }

    private static async findSystemGitWin32(base: string): Promise<CvsPartialInfo> {
        if (!base) {
            return Promise.reject<CvsPartialInfo>("Not found");
        }

        return GitUtils.findSpecificGit(path.join(base, "Git", "cmd", "git.exe"));
    }

    private static async findGitHubGitWin32(): Promise<CvsPartialInfo> {
        const gitHub = path.join(process.env["LOCALAPPDATA"], "GitHub");

        const prom: Promise<string[]> = new Promise<string[]>((resolve, reject) => {
            fs.readdir(gitHub, (err, result) => err ? reject(err) : resolve(result));
        });

        return prom.then((children) => {
            const git = children.filter((child) => /^PortableGit/.test(child))[0];

            if (!git) {
                return Promise.reject<CvsPartialInfo>("Not found");
            }

            return GitUtils.findSpecificGit(path.join(gitHub, git, "cmd", "git.exe"));
        });
    }

    //TODO: switch to cp_promise
    private static async findGitDarwin(): Promise<CvsPartialInfo> {
        return new Promise<CvsPartialInfo>((c, e) => {
            cp.exec("which git", (err, gitPathBuffer) => {
                if (err) {
                    return e("git not found");
                }

                const path = gitPathBuffer.toString().replace(/^\s+|\s+$/g, "");

                function getVersion(path: string) {
                    // make sure git executes
                    cp.exec("git --version", (err, stdout: Buffer) => {
                        if (err) {
                            return e("git not found");
                        }

                        return c({path, version: GitUtils.parseVersion(stdout.toString("utf8").trim())});
                    });
                }

                if (path !== "/usr/bin/git") {
                    return getVersion(path);
                }

                // must check if XCode is installed
                cp.exec("xcode-select -p", (err: any) => {
                    if (err && err.code === 2) {
                        // git is not installed, and launching /usr/bin/git
                        // will prompt the user to install it

                        return e("git not found");
                    }
                    getVersion(path);
                });
            });
        });
    }

    private static async findSpecificGit(path: string): Promise<CvsPartialInfo> {
        const promiseResult = await cp_promise.exec(`${path} --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!versionCommandResult) {
            throw new Error("Not found");
        }

        return {path, version: GitUtils.parseVersion(versionCommandResult)};
    }

    private static parseVersion(raw: string): string {
        return raw.replace(/^git version /, "");
    }
}
