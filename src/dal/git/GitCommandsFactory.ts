import {CpProxy} from "../../bll/moduleproxies/cp-proxy";
import {GitStatusCommand} from "./GitStatusCommand";
import {GitStatusRowsParser} from "./GitStatusRowsParser";
import {GetRepoBranchNameCommand} from "./GetRepoBranchNameCommand";
import {GetRemoteNameCommand} from "./GetRemoteNameCommand";
import {GetLocalBranchNameCommand} from "./GetLocalBranchNameCommand";
import {GetRemoteBranchName} from "./GetRemoteBranchName";
import {GetLastCompatibleMergeBaseRev} from "./GetLastCompatibleMergeBaseRev";
import {GetFirstMonthRev} from "./GetFirstMonthRev";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {GetStagedFileContentLength} from "./GetStagedFileContentLength";
import {GetStagedFileContentStream} from "./GetStagedFileContentStream";
import {Settings} from "../../bll/entities/settings";

export class GitCommandsFactory {

    private constructor(private readonly cpProxy: CpProxy,
                        private readonly settings: Settings,
                        private readonly workspaceRootPath: string,
                        private readonly gitPath: string) {
        //
    }

    public async getStatusCommand(): Promise<GitStatusCommand> {
        const statusRowsParser: GitStatusRowsParser = await GitStatusRowsParser.prepareInstance(this.settings,
            this.getFirstMonthRevCommand(),
            this.getLastCompatibleMergeBaseRevCommand());
        return new GitStatusCommand(this.workspaceRootPath, this.gitPath, this.cpProxy, statusRowsParser);
    }

    public getRepoBranchNameCommand(): GetRepoBranchNameCommand {
        const getRemoteNameCommand: GetRemoteNameCommand = this.getGetRemoteNameCommand();
        return new GetRepoBranchNameCommand(this.workspaceRootPath, this.gitPath, this.cpProxy, getRemoteNameCommand);
    }

    private getGetRemoteNameCommand(): GetRemoteNameCommand {
        const getLocalBranchNameCommand: GetLocalBranchNameCommand = this.getLocalBranchNameCommand();
        return new GetRemoteNameCommand(this.workspaceRootPath, this.gitPath, this.cpProxy, getLocalBranchNameCommand);
    }

    private getLocalBranchNameCommand(): GetLocalBranchNameCommand {
        return new GetLocalBranchNameCommand(this.workspaceRootPath, this.gitPath, this.cpProxy);
    }

    public getLastCompatibleMergeBaseRevCommand(): GetLastCompatibleMergeBaseRev {
        const getRemoteBranchNameCommand: GetRemoteBranchName = this.getRemoteBranchCommand();
        return new GetLastCompatibleMergeBaseRev(this.workspaceRootPath,
            this.gitPath,
            this.cpProxy,
            getRemoteBranchNameCommand);
    }

    private getRemoteBranchCommand(): GetRemoteBranchName {
        return new GetRemoteBranchName(this.workspaceRootPath, this.gitPath, this.cpProxy);
    }

    public getFirstMonthRevCommand() {
        return new GetFirstMonthRev(this.workspaceRootPath, this.gitPath, this.cpProxy);
    }

    public getStagedFileContentStreamCommand(cvsResource: CvsResource): GetStagedFileContentStream {
        return new GetStagedFileContentStream(this.workspaceRootPath,
            this.gitPath,
            this.cpProxy,
            cvsResource,
            this.getStagedFileContentLengthCommand(cvsResource));

    }

    private getStagedFileContentLengthCommand(cvsResource: CvsResource) {
        return new GetStagedFileContentLength(this.workspaceRootPath, this.gitPath, cvsResource, this.cpProxy);
    }

    public static getInstance(cpProxy: CpProxy,
                              settings: Settings,
                              workspaceRootPath: string,
                              gitPath: string): GitCommandsFactory {
        return new GitCommandsFactory(cpProxy, settings, workspaceRootPath, gitPath);
    }
}
