import {Build} from "./build";
import {Logger} from "../utils/logger";
import {UserChangeStatus} from "../utils/constants";

export class Change {

    public constructor(public readonly id: number,
                       public readonly isPersonal: boolean,
                       public readonly status: UserChangeStatus,
                       public builds: Build[],
                       public readonly myChangesCount: number,
                       public readonly myDescription: string,
                       public readonly myVersionControlName: string,
                       public readonly vcsDate: Date,
                       public readonly displayVersion: string) {
        //
    }

    public toString(): string {
        return `${this.id}:${this.status}`;
    }

    public static fromXmlRpcObject(changeObj: any): Change {
        const isPersonal: boolean = Change.isPersonal(changeObj);
        const id: number = Change.getId(changeObj);
        const status: UserChangeStatus = Change.getStatus(changeObj);
        const builds: Build[] = Change.getBuilds(changeObj);
        const changesCount: number = Change.getChangesCount(changeObj);
        const description: string = Change.getDescription(changeObj);
        const versionControlName: string = Change.getVersionControlName(changeObj);
        const vcsDate: Date = Change.getVcsDate(changeObj);
        const myDisplayVersion: string = Change.getDisplayVersion(changeObj);
        return new Change(id, isPersonal, status, builds, changesCount,
                          description, versionControlName, vcsDate, myDisplayVersion);
    }

    private static isPersonal(changeObj: any): boolean {
        return changeObj.mod[0].personal[0] === true;
    }

    private static getId(changeObj: any): number {
        return changeObj.mod[0].id[0];
    }

    private static getStatus(changeObj: any): UserChangeStatus {
        const text = changeObj.myStatus[0];

        switch (text) {
            case "CANCELED":
                return UserChangeStatus.CANCELED;
            case "CHECKED":
                return UserChangeStatus.CHECKED;
            case "FAILED":
                return UserChangeStatus.FAILED;
            case "PENDING":
                return UserChangeStatus.PENDING;
            case "RUNNING_FAILED":
                return UserChangeStatus.RUNNING_FAILED;
            case "RUNNING_SUCCESSFULY":
                return UserChangeStatus.RUNNING_SUCCESSFULY;
            default:
                return undefined;
        }
    }

    private static getBuilds(changeObj: any): Build[] {
        if (!changeObj ||
            !changeObj.myTypeToInstanceMap ||
            !changeObj.myTypeToInstanceMap[0] ||
            !changeObj.myTypeToInstanceMap[0].entry ||
            !changeObj.myTypeToInstanceMap[0].entry[0] ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build[0] ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build[0].id) {
            return [];
        }
        const builds: Build[] = [];
        changeObj.myTypeToInstanceMap[0].entry.forEach((entry) => {
            if (entry && entry.Build && entry.Build[0]) {
                builds.push(Build.fromXmlRpcObject(entry.Build[0]));
            }
        });
        return builds;
    }

    private static getDescription(changeObj: any): string {
        return changeObj.mod[0].myDescription[0].toString().trim();

    }

    private static getVersionControlName(changeObj: any): string {
        return changeObj.mod[0].myVersionControlName[0];
    }

    private static getChangesCount(changeObj: any): number {
        return changeObj.mod[0].myChangesCount[0];
    }

    private static getVcsDate(changeObj: any): Date {
        return new Date(+changeObj.mod[0].myVcsDate[0]);
    }

    private static getDisplayVersion(changeObj: any): string {
        if (!changeObj ||
            !changeObj.mod ||
            !changeObj.mod[0] ||
            !changeObj.mod[0].myDisplayVersion ||
            changeObj.mod[0].myDisplayVersion[0] === undefined) {
            Logger.logDebug(`Change#getDisplayVersion: displayVersion is not reachable. default: empty line`);
            return "";
        }
        return changeObj.mod[0].myDisplayVersion[0];
    }
}
