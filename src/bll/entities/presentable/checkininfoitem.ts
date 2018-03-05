import * as path from "path";
import {TreeItemCollapsibleState, Uri} from "vscode";
import {CheckInInfo} from "../checkininfo";
import {CvsResourceItem} from "../cvsresources/cvsresourceitem";
import {ExpandableItem} from "./expandableitem";

export class CheckInInfoItem extends ExpandableItem {

    private checkInInfo: CheckInInfo;
    public readonly cvsLocalResources: CvsResourceItem[] = [];

    constructor(checkInInfo: CheckInInfo) {
        super(checkInInfo.rootPath, TreeItemCollapsibleState.Collapsed);
        this.checkInInfo = checkInInfo;
        checkInInfo.cvsLocalResources.forEach((resource) => this.cvsLocalResources.push(new CvsResourceItem(resource)));
    }

    public get iconPath(): string | Uri | { light: string | Uri; dark: string | Uri } {
            const iconName: string = "project.svg";
            return {
                light: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "light", iconName),
                dark: path.join(__dirname, "..", "..", "..", "..", "..", "resources", "icons", "dark", iconName)
            };
        }

    public get item(): CheckInInfo {
        return this.checkInInfo;
    }
}
