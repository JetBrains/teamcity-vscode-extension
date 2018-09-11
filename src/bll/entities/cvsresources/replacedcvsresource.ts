import {CvsFileStatusCode} from "../../utils/constants";
import {CvsResource} from "./cvsresource";

export class ReplacedCvsResource extends CvsResource {
    private readonly MODIFIED_PREFIX: number = 25;

    constructor(fileAbsPath: string,
                label: string,
                fileServerPath: string,
                prevFileAbsPath: string,
                prevFileServerPath: string) {
        super(CvsFileStatusCode.RENAMED, fileAbsPath, label, fileServerPath, prevFileAbsPath, prevFileServerPath);
    }

    public getPrefix(): number {
        return this.MODIFIED_PREFIX;
    }
}
