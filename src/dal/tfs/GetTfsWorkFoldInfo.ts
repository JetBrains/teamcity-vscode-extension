import {ITfsWorkFoldInfo} from "./ITfsWorkFoldInfo";
import * as url from "url";
import {Logger} from "../../bll/utils/logger";
import {Utils} from "../../bll/utils/utils";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";

export class GetTfsWorkFoldInfo {
    constructor(private readonly workspaceRootPath: string,
                private readonly tfPath: string,
                private readonly cpProxy: CpProxy) {
        //
    }

    public async execute(): Promise<ITfsWorkFoldInfo> {
        const parseWorkFoldRegexp = /Collection: (.*?)\r\n\s(.*?):\s(.*)/;

        try {
            const result: {stdout: string} = await this.cpProxy.execAsync(this.getCommand());
            const tfsWorkFoldResult: string = result.stdout.toString().trim();
            const match = parseWorkFoldRegexp.exec(tfsWorkFoldResult);
            const repositoryUrl: string = match[1];
            const purl: url.Url = url.parse(repositoryUrl);
            if (purl) {
                const collectionName = purl.host.split(".")[0];
                const tfsInfo: ITfsWorkFoldInfo = {
                    repositoryUrl: repositoryUrl,
                    collectionName: collectionName,
                    projectRemotePath: match[2],
                    projectLocalPath: match[3]
                };
                Logger.LogObject(tfsInfo);
                return tfsInfo;
            } else {
                Logger.logError(`GetTfsWorkFoldInfoo: TfsInfo cannot be parsed.`);
                return undefined;
            }
        } catch (err) {
            Logger.logError("GetTfsWorkFoldInfo: caught an exception during tf workfold command:" +
                Utils.formatErrorMessage(err));
            return undefined;
        }
    }

    private getCommand(): string {
        return `"${this.tfPath}" workfold "${this.workspaceRootPath}"`;
    }
}
