import {CvsFileStatusCode} from "../../utils/constants";
import {CvsResource} from "./cvsresource";

export class DeletedCvsResource extends CvsResource {
    private readonly DELETE_PREFIX: number = 3;

    constructor(prevFileAbsPath: string, label: string) {
        super(CvsFileStatusCode.DELETED, prevFileAbsPath, label);
    }

    public getPrefix(): number {
        return this.DELETE_PREFIX;
    }
}
