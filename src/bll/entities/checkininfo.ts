import {CvsResource} from "./cvsresources/cvsresource";
import {CvsSupportProvider} from "../../dal/cvsprovider";

export class CheckInInfo {

    public message: string;

    constructor(public readonly cvsLocalResources: CvsResource[],
                private readonly cvsProvider: CvsSupportProvider,
                private readonly workspaceRootPath: string) {
        //
    }

    public getWorkspaceRootPath(): string {
        return this.workspaceRootPath;
    }

    public getCvsProvider(): CvsSupportProvider {
        return this.cvsProvider;
    }

    /**
     * There are two allowed tfs file path formats for tfvc:
     * * File path format : http[s]://<server-path>:<server-port>/$foo/bar
     * * File path format : guid://guid/$foo/bar
     * We use first, because we can get user collection guid without his credential.
     * @return - A promise for array of formatted names of files, that are required for TeamCity remote run.
     */
    public getFormattedFileNames(): string[] {
        const formattedChangedFiles: string[] = [];
        this.cvsLocalResources.forEach((localResource: CvsResource) => {
            formattedChangedFiles.push(localResource.serverFilePath);
        });
        return formattedChangedFiles;
    }
}
