import {CvsResource} from "./cvsresources/cvsresource";
import {CvsSupportProvider} from "../../dal/cvsprovider";

export class CheckInInfo {

    public message: string;
    public readonly cvsLocalResources: CvsResource[];
    public readonly serverItems: string[];
    public readonly workItemIds: number[];
    public readonly cvsProvider: CvsSupportProvider;

    constructor(cvsLocalResources: CvsResource[], cvsProvider: CvsSupportProvider, serverItems: string[] = [], workItemIds: number[] = []) {
        this.cvsLocalResources = cvsLocalResources;
        this.serverItems = serverItems;
        this.workItemIds = workItemIds;
        this.cvsProvider = cvsProvider;
    }

    public get rootPath() {
        return this.cvsProvider.getRootPath();
    }
}
