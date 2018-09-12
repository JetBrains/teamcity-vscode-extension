import {Finder} from "./finder";
import {Constants, TYPES} from "../utils/constants";
import {OsProxy} from "../moduleproxies/os-proxy";
import {CpProxy} from "../moduleproxies/cp-proxy";
import {WorkspaceProxy} from "../moduleproxies/workspace-proxy";
import {inject, injectable} from "inversify";

@injectable()
export class TfvcPathFinder implements Finder {

    constructor(@inject(TYPES.OsProxy) private readonly os: OsProxy,
                @inject(TYPES.CpProxy) private readonly cp: CpProxy,
                @inject(TYPES.WorkspaceProxy) private readonly workspaceProxy: WorkspaceProxy) {
        //
    }

    public async find(): Promise<string> {
        const pathHint = this.getPathHint();
        try {
            return await this.findTfsPath(pathHint);
        } catch (err) {
            throw new Error("tfvc command line util not found");
        }
    }

    private async findTfsPath(pathHint: string): Promise<string> {
        pathHint = this.replaceLeadingTildeForUnixLikePlatforms(pathHint);
        if (pathHint) {
            pathHint = pathHint.trim();
        }
        const firstSearchPromise = pathHint ? this.checkPath(pathHint) : Promise.reject<string>(undefined);
        return firstSearchPromise.then(void 0, () => this.checkPath("tf"));
    }

    private getPathHint(): string {
        return this.workspaceProxy.getConfigurationValue(Constants.TFS_LOCATION_SETTING_NAME);
    }

    private replaceLeadingTildeForUnixLikePlatforms(location: string): string {
        if (location && location.startsWith("~/") && this.isUnixLikePlatform()) {
            return location.replace(/^~(\/)/, `${this.os.homedir()}$1`);
        } else {
            return location;
        }
    }

    private isUnixLikePlatform(): boolean {
        return this.os.platform() === "darwin" || this.os.platform() === "linux";
    }

    private async checkPath(path: string): Promise<string> {
        const promiseResult = await this.cp.execAsync(`"${path}"`);
        const tfCommandResult: string = promiseResult.stdout.toString().trim();
        if (!tfCommandResult) {
            return Promise.reject<string>(undefined);
        }
        return path;
    }
}
