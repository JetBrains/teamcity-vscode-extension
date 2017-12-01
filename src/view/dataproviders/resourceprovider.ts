"use strict";

import {DataProvider} from "./dataprovider";
import {TreeItem, TreeDataProvider, ProviderResult, Event, commands, Disposable, EventEmitter} from "vscode";
import {DataProviderEnum} from "../providermanager";
import {injectable} from "inversify";
import {CheckInInfo} from "../../bll/entities/checkininfo";
import {CvsResource} from "../../bll/entities/cvsresources/cvsresource";
import {Logger} from "../../bll/utils/logger";

@injectable()
export class ResourceProvider extends DataProvider {
    private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

    private checkInArray: CheckInInfo[] = [];

    setContent(checkInArray: CheckInInfo[]): void {
        this.checkInArray = checkInArray;
    }

    resetTreeContent(): void {
        this.checkInArray = [];
    }

    refreshTreePresentation(): void {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: TreeItem):  TreeItem[] | Thenable<TreeItem[]> {
        if (!element) {
            return this.checkInArray;
        } else if (element instanceof CheckInInfo) {
            return element.cvsLocalResources;
        }
        Logger.logError("A content of a Resource Provider was not determined." + element);
        return [];
    }

    public getSelectedContent(): CheckInInfo[] {
        const result: CheckInInfo[] = [];
        if (this.checkInArray) {
            this.checkInArray.forEach((checkInInfo: CheckInInfo) => {
                const checkInInfoToPush = this.getCheckInInfoWithIncludedResources(checkInInfo);
                if (checkInInfoToPush.cvsLocalResources.length !== 0) {
                    result.push(this.getCheckInInfoWithIncludedResources(checkInInfoToPush));
                }
            });
        }
        return result;
    }

    private getCheckInInfoWithIncludedResources(checkInInfo: CheckInInfo): CheckInInfo {
        const result: CheckInInfo = checkInInfo;
        const includedResources: CvsResource[] = [];
        const localResources: CvsResource[] = checkInInfo.cvsLocalResources;
        localResources.forEach((resource: CvsResource) => {
            if (resource.isIncluded) {
                includedResources.push(resource);
            }
        });
        result.cvsLocalResources = includedResources;
        return result;
    }

    getType(): DataProviderEnum {
        return DataProviderEnum.ResourcesProvider;
    }

}
