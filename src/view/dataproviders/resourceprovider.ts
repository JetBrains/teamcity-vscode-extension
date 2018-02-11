import {DataProvider} from "./dataprovider";
import {Event, EventEmitter, TreeItem} from "vscode";
import {DataProviderEnum} from "../../bll/utils/constants";
import {injectable} from "inversify";
import {CheckInInfo} from "../../bll/entities/checkininfo";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {CvsResourceItem} from "../../bll/entities/cvsresources/cvsresourceitem";
import {Logger} from "../../bll/utils/logger";
import {CheckInInfoItem} from "../../bll/entities/checkininfoitem";
import {Utils} from "../../bll/utils/utils";

@injectable()
export class ResourceProvider extends DataProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private checkInArray: CheckInInfoItem[] = [];

    setContent(checkInArray: CheckInInfo[]): void {
        Utils.clearArray(this.checkInArray);
        checkInArray.forEach((changes) => this.checkInArray.push(new CheckInInfoItem(changes)));
    }

    resetTreeContent(): void {
        this.checkInArray = [];
    }

    refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: CheckInInfoItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.checkInArray;
        } else if (element instanceof CheckInInfoItem) {
            return element.cvsLocalResources;
        }
        Logger.logError("A content of a Resource Provider was not determined." + element);
        return [];
    }

    public getSelectedContent(): CheckInInfo[] {
        const result: CheckInInfo[] = [];
        if (this.checkInArray) {
            this.checkInArray.forEach((checkInInfoItem: CheckInInfoItem) => {
                const checkInInfoToPush: CheckInInfo = this.getCheckInInfoWithIncludedResources(checkInInfoItem);
                if (checkInInfoToPush.cvsLocalResources.length !== 0) {
                    result.push(checkInInfoToPush);
                }
            });
        }
        return result;
    }

    private getCheckInInfoWithIncludedResources(checkInInfo: CheckInInfoItem): CheckInInfo {
        const includedResources: CvsResource[] = [];
        const localResources: CvsResourceItem[] = checkInInfo.cvsLocalResources;
        localResources.forEach((resource: CvsResourceItem) => {
            if (resource.isIncluded) {
                includedResources.push(resource.item);
            }
        });

        return new CheckInInfo(includedResources, checkInInfo.item.cvsProvider, checkInInfo.item.serverItems, checkInInfo.item.workItemIds);
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.ResourcesProvider;
    }

}
