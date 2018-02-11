import {CvsFileStatusCode} from "../../utils/constants";
import {CvsResource} from "./cvsresource";

export class ReplacedCvsResource extends CvsResource {
    private readonly MODIFIED_PREFIX: number = 25;

    constructor(fileAbsPath: string, label: string, prevFileAbsPath: string) {
        super(CvsFileStatusCode.RENAMED, fileAbsPath, label, prevFileAbsPath);
    }

    public getPrefix(): number {
        return this.MODIFIED_PREFIX;
    }
}
