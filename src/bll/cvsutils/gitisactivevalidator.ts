import {Logger} from "../utils/logger";
import {CpProxy} from "../moduleproxies/cp-proxy";
import {GitParser} from "./git-parser";

export class GitIsActiveValidator {
    private readonly cpProxy: CpProxy;

    constructor(cpProxy?: CpProxy) {
        this.cpProxy = cpProxy || new CpProxy();
    }

    public async validate(workspaceRootPath: string, gitPath: string): Promise<void> {
        await this.checkVersionCompatibility(gitPath);
        await this.checkIsGitRepository(workspaceRootPath, gitPath);
    }

    private async checkVersionCompatibility(path: string) {
        const version: string = await this.getVersion(path);
        GitIsActiveValidator.checkVersion(version);
    }

    private async getVersion(path: string): Promise<string> {
        const promiseResult = await this.cpProxy.execAsync(`"${path}" --version`);
        const versionCommandResult: string = promiseResult.stdout.toString("utf8").trim();
        return GitParser.parseVersion(versionCommandResult);
    }

    private static checkVersion(version: string): void {
        if (GitIsActiveValidator.isFirstVersion(version)) {
            Logger.logWarning(`GitUtils#collectInfo: git ${version} installed. TeamCity extension requires git >= 2`);
            throw new Error(`Git ${version} installed. TeamCity extension requires git >= 2`);
        }
    }

    private static isFirstVersion(version: string): boolean {
        return /^[01]/.test(version);
    }

    private async checkIsGitRepository(workspaceRootPath: string, gitPath: string): Promise<void> {
        const revParseCommand: string = `"${gitPath}" -C "${workspaceRootPath}" rev-parse --show-toplevel`;
        Logger.logDebug(`GitUtils#collectInfo: revParseCommand is ${revParseCommand}`);
        try {
            await this.cpProxy.execAsync(revParseCommand);
        } catch (err) {
            throw new Error("Git repository was not determined");
        }
    }
}
