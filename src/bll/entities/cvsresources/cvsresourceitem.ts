import * as path from "path";
import {Uri} from "vscode";
import {LeaveSelectableItem} from "../presentable/leaveselectableitem";
import {CvsResource} from "./cvsresource";

export class CvsResourceItem extends LeaveSelectableItem {
    private readonly cvsResource: CvsResource;

    constructor(cvsResource: CvsResource) {
        super(cvsResource.fileName, true);
        this.cvsResource = cvsResource;
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
        const iconName: string = `status-${this.isIncluded ? this.cvsResource.status : "I"}.svg`;
        return {
            light: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "light", iconName),
            dark: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "dark", iconName)
        };
    }

    public get item(): CvsResource {
        return this.cvsResource;
    }
}
