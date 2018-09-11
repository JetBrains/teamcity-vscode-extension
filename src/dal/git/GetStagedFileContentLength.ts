import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {Utils} from "../../bll/utils/utils";
import * as stream from "stream";
import {Logger} from "../../bll/utils/logger";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";

export class GetStagedFileContentLength {
    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private readonly cvsResource: CvsResource,
                private readonly cpProxy: CpProxy) {
        //
    }

    public execute(): Promise<number> {
        const relativePath = Utils.getNormalizedRelativePath(this.cvsResource, this.workspaceRootPath);
        const options: string[] = this.getCommandOptions(relativePath);
        const showFileStream: stream.Readable = this.cpProxy.spawn(`${this.gitPath}`, options).stdout;
        let streamLength: number = 0;
        return new Promise<number>((resolve, reject) => {
            showFileStream.on("end", () => {
                Logger.logDebug(`GitSupportProvider#getStagedFileContentLength: stream for counting ` +
                    `bytes of ${this.cvsResource.fileAbsPath} has ended. Total size is ${streamLength}`);
                resolve(streamLength);
            });
            showFileStream.on("close", () => {
                Logger.logError(`GitSupportProvider#getStagedFileContentLength: Stream was closed before it ended`);
                reject("GitProvider#getStagedFileContentLength: Stream was closed before it ended");
            });
            showFileStream.on("error", (err) => {
                Logger.logError(`GitSupportProvider#getStagedFileContentLength: stream for counting ` +
                    `bytes of ${this.cvsResource.fileAbsPath} has ended exited with error
                     ${Utils.formatErrorMessage(err)}`);
                reject(err);
            });
            showFileStream.on("data", (chunk) => {
                streamLength += chunk.length;
            });
        });
    }

    private getCommandOptions(relativePath: string): string[] {
        return [`-C`, `${this.workspaceRootPath}`, `show`, `:${relativePath}`];
    }
}
