import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {GetStagedFileContentLength} from "./GetStagedFileContentLength";
import {ReadableSet} from "../../bll/utils/readableset";
import {Utils} from "../../bll/utils/utils";
import * as stream from "stream";
import {CpProxy} from "../../bll/moduleproxies/cp-proxy";

export class GetStagedFileContentStream {
    constructor(private readonly workspaceRootPath: string,
                private readonly gitPath: string,
                private readonly cpProxy: CpProxy,
                private readonly cvsResource: CvsResource,
                private readonly getStagedFileContentLengthCommand: GetStagedFileContentLength) {
        //
    }

    public async execute(): Promise<ReadableSet> {
        const relativePath: string = Utils.getNormalizedRelativePath(this.cvsResource, this.workspaceRootPath);
        const commandOptions: string[] = this.getCommandOptions(relativePath);

        const streamLength: number = await this.getStagedFileContentLengthCommand.execute();
        const showFileStream: stream.Readable = this.cpProxy.spawn(`${this.gitPath}`, commandOptions).stdout;

        return {stream: showFileStream, length: streamLength};
    }

    private getCommandOptions(relativePath: string): string[] {
        return [`-C`, `${this.workspaceRootPath}`, `show`, `:${relativePath}`];
    }
}
