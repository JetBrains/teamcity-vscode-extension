import * as path from "path";
import {Finder} from "./finder";
import {Constants, TYPES} from "../utils/constants";
import {MessageConstants} from "../utils/messageconstants";
import {FsProxy} from "../moduleproxies/fs-proxy";
import {ProcessProxy} from "../moduleproxies/process-proxy";
import {CpProxy} from "../moduleproxies/cp-proxy";
import {WorkspaceProxy} from "../moduleproxies/workspace-proxy";
import {inject, injectable} from "inversify";

@injectable()
export class GitPathFinder implements Finder {
    private static readonly GIT_IS_NOT_INSTALLED_ERR_CODE: number = 2;

    constructor(@inject(TYPES.CpProxy) private readonly cpProxy: CpProxy,
                @inject(TYPES.ProcessProxy) private readonly processProxy: ProcessProxy,
                @inject(TYPES.FsProxy) private readonly fsProxy: FsProxy,
                @inject(TYPES.WorkspaceProxy) private readonly workspaceProxy: WorkspaceProxy) {
        //
    }

    public async find(): Promise<string> {
        const pathHint = this.getPathHint();
        try {
            return await this.findGitPath(pathHint);
        } catch (err) {
            throw new Error(MessageConstants.GIT_PATH_IS_NOT_FOUND);
        }
    }

    private getPathHint(): string {
        return this.workspaceProxy.getConfigurationValue(Constants.GIT_PATH_SETTING_NAME);
    }

    private async findGitPath(hint: string | undefined): Promise<string> {
        const firstSearchPromise = hint ? this.checkPath(hint) : Promise.reject<string>(undefined);
        return firstSearchPromise.then(void 0, () => {
            switch (this.processProxy.platform) {
                case "win32":
                    return this.findGitWin32();
                case "darwin":
                    return this.findGitDarwin();
                default:
                    return this.checkPath("git");
            }
        });
    }

    private async checkPath(path: string): Promise<string> {
        const getGitVersionCommand = `"${path}" --version`;
        const promiseResult = await this.cpProxy.execAsync(getGitVersionCommand);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        if (!versionCommandResult) {
            return Promise.reject<string>(undefined);
        }
        return path;
    }

    private async findGitWin32(): Promise<string> {
        return this.checkPath("git")
            .then(void 0, () => this.findSystemGitWin32(this.processProxy.env["ProgramW6432"]))
            .then(void 0, () => this.findSystemGitWin32(this.processProxy.env["ProgramFiles(x86)"]))
            .then(void 0, () => this.findSystemGitWin32(this.processProxy.env["ProgramFiles"]))
            .then(void 0, () => this.findGitHubGitWin32());
    }

    private async findSystemGitWin32(base: string): Promise<string> {
        if (!base) {
            return Promise.reject<string>(undefined);
        }
        return this.checkPath(path.join(base, "Git", "cmd", "git.exe"));
    }

    private async findGitHubGitWin32(): Promise<string> {
        const gitHubDirectoryPath = path.join(this.processProxy.env["LOCALAPPDATA"], "GitHub");
        const childObjects: string[] = await this.getChildObjects(gitHubDirectoryPath);
        const portableGitPath = await GitPathFinder.getFirstPortableGitObject(childObjects);
        return this.checkPath(path.join(gitHubDirectoryPath, portableGitPath, "cmd", "git.exe"));
    }

    private async getChildObjects(path: string): Promise<string[]> {
        return this.fsProxy.readdirAsync(path);
    }

    private static async getFirstPortableGitObject(childObjects: string[]): Promise<string> {
        const portableGitPath = childObjects.filter((child) => /^PortableGit/.test(child))[0];
        if (!portableGitPath) {
            return Promise.reject<string>(undefined);
        }
        return portableGitPath;
    }

    private async findGitDarwin(): Promise<string> {
        try {
            const promiseResult = await this.cpProxy.execAsync("which git");
            const whichCommandResult: string = promiseResult.stdout.toString("utf8").trim();
            const path = whichCommandResult.toString().replace(/^\s+|\s+$/g, "");
            if (path !== "/usr/bin/git") {
                return this.checkPath(path);
            }
            return this.checkPromptAbsence().then(() => this.checkPath(path));
        } catch (err) {
            return Promise.reject<string>(undefined);
        }
    }

    private async checkPromptAbsence() {
        const printDeveloperDirectoryPathCommand = "xcode-select -p";
        try {
            await this.cpProxy.execAsync(printDeveloperDirectoryPathCommand);
        } catch (err) {
            if (GitPathFinder.isGitNotInstalled(err)) {
                // launching /usr/bin/git will prompt the user to install it
                return Promise.reject<string>(undefined);
            }
        }
    }

    private static isGitNotInstalled(err: any) {
        return err.code === GitPathFinder.GIT_IS_NOT_INSTALLED_ERR_CODE;
    }
}
